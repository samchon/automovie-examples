param(
  [ValidateSet("gpu", "software")] [string]$Backend = "gpu",
  [string]$Picture,
  [string]$AudioDirectory
)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
Push-Location -LiteralPath $root
try {
  $cache = Join-Path $root ".cache/local-0.3.0/two-hands"
  $output = Join-Path $root "media/automovie/two-hands/videos"
  New-Item -ItemType Directory -Path $output,$cache -Force | Out-Null

  if (!$Picture) {
    $pictureDirectory = Join-Path $cache "picture"
    pnpm run render --subject two-hands --backend $Backend --out $pictureDirectory
    if ($LASTEXITCODE) { throw "Picture render failed ($LASTEXITCODE)" }
    $Picture = Join-Path $pictureDirectory "film.mp4"
  }
  $Picture = (Resolve-Path -LiteralPath $Picture).Path
  if (!$AudioDirectory) {
    $AudioDirectory = Join-Path $cache "audio"
    & (Join-Path $PSScriptRoot "two-hands-audio.ps1") -OutputDirectory $AudioDirectory
  }
  $mix = (Resolve-Path -LiteralPath (Join-Path $AudioDirectory "mix.wav")).Path
  $captions = (Resolve-Path -LiteralPath (Join-Path $AudioDirectory "captions.srt")).Path
  $ffmpeg = if ($env:FFMPEG_PATH) { $env:FFMPEG_PATH } else { node --input-type=commonjs -e "process.stdout.write(require('ffmpeg-static'))" }
  if (!(Test-Path -LiteralPath $ffmpeg -PathType Leaf)) { throw "FFmpeg unavailable at $ffmpeg" }
  $temporaryBase = Join-Path $output ("two-hands-" + [guid]::NewGuid().ToString("N"))
  $temporary = "$temporaryBase.mp4"
  $temporaryReport = "$temporaryBase.json"
  $previousReport = "$temporaryBase.previous.json"
  $final = Join-Path $output "film.mp4"
  $reportPath = Join-Path (Split-Path -LiteralPath $Picture) "render-report.json"
  $finalReport = Join-Path $output "picture-render-report.json"
  $reportChanged = $false
  $publication = $null
  try {
    & $ffmpeg -nostdin -hide_banner -loglevel error -i $Picture -i $mix -f srt -i $captions -map 0:v:0 -map 1:a:0 -map 2:s:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -c:s mov_text -metadata "title=두 번째 손" -metadata:s:a:0 "language=kor" -metadata:s:s:0 "language=kor" -disposition:s:0 0 -movflags +faststart -t 180 $temporary
    if ($LASTEXITCODE) { throw "Broadcast assembly failed ($LASTEXITCODE)" }
    $publication = [IO.File]::Open((Join-Path $cache 'publish.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    if (Test-Path -LiteralPath $reportPath -PathType Leaf) {
      Copy-Item -LiteralPath $reportPath -Destination $temporaryReport
      if (Test-Path -LiteralPath $finalReport -PathType Leaf) {
        [IO.File]::Replace($temporaryReport, $finalReport, $previousReport)
      } else {
        [IO.File]::Move($temporaryReport, $finalReport)
      }
      $reportChanged = $true
    } elseif (Test-Path -LiteralPath $finalReport -PathType Leaf) {
      [IO.File]::Move($finalReport, $previousReport)
      $reportChanged = $true
    }
    [IO.File]::Move($temporary, $final, $true)
    $reportChanged = $false
  } catch {
    if ($reportChanged) {
      if (Test-Path -LiteralPath $previousReport -PathType Leaf) {
        [IO.File]::Move($previousReport, $finalReport, $true)
      } else {
        Remove-Item -LiteralPath $finalReport
      }
      $reportChanged = $false
    }
    throw
  } finally {
    $disposable = @($temporary, $temporaryReport)
    if (!$reportChanged) { $disposable += $previousReport }
    foreach ($path in $disposable) {
      if (Test-Path -LiteralPath $path -PathType Leaf) { Remove-Item -LiteralPath $path -ErrorAction SilentlyContinue }
    }
    if ($null -ne $publication) { $publication.Dispose() }
  }
  Get-Item -LiteralPath $final
} finally {
  Pop-Location
}
