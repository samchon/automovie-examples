param(
  [string]$Picture = ".cache/sol-0.3.0/bread-cloths/verified-picture-v3/film.mp4",
  [string]$Sound = ".cache/sol-0.3.0/bread-cloths/sound-v2/road-stereo.wav",
  [string]$Output = "media/automovie/bread-cloths/videos/bread-cloths.mp4",
  [string]$Review = ".cache/sol-0.3.0/bread-cloths/final-v3-delivery-review",
  [string]$Source = ".cache/sol-0.3.0/bread-cloths/verified-picture-v3",
  [string]$Probe = "../../../.cache/film-release-0.3.0/media-checks/node_modules/@ffprobe-installer/win32-x64/ffprobe.exe"
)

$ErrorActionPreference = 'Stop'
$ffmpeg = (Resolve-Path 'node_modules/ffmpeg-static/ffmpeg.exe').Path
$picturePath = (Resolve-Path $Picture).Path
$soundPath = (Resolve-Path $Sound).Path
$outputPath = [IO.Path]::GetFullPath($Output)
$outputDirectory = [IO.Path]::GetDirectoryName($outputPath)
[IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
$partialPath = Join-Path $outputDirectory "bread-cloths-mux-$PID.mp4"

# Preserve the renderer's picture. Normalize the stereo dialogue and Foley for this web delivery.
$muxArgs = @(
  '-v', 'error', '-y', '-threads', '2', '-filter_threads', '2', '-i', $picturePath, '-i', $soundPath, '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'copy', '-af', 'volume=2.5dB,alimiter=limit=0.79:level=false:latency=true', '-c:a', 'aac', '-b:a', '192k',
  '-ar', '48000', '-t', '60', '-movflags', '+faststart', $partialPath
)
try {
  & $ffmpeg @muxArgs
  if ($LASTEXITCODE -ne 0) { throw "Mux failed with exit code $LASTEXITCODE" }
  [IO.File]::Move($partialPath, $outputPath, $true)
} finally {
  if (Test-Path -LiteralPath $partialPath) { Remove-Item -LiteralPath $partialPath }
}

$measureArgs = @((Join-Path $PSScriptRoot 'measure.py'), $ffmpeg, $outputPath, $Review)
if (Test-Path $Probe) { $measureArgs += @('--ffprobe', (Resolve-Path $Probe).Path) }
if (Test-Path $Source) { $measureArgs += @('--source', (Resolve-Path $Source).Path) }
& python @measureArgs
if ($LASTEXITCODE -ne 0) { throw "Delivery measurement failed with exit code $LASTEXITCODE" }
$report = Join-Path ([IO.Path]::GetDirectoryName($picturePath)) 'render-report.json'
if (Test-Path -LiteralPath $report) {
  Copy-Item -LiteralPath $report -Destination (Join-Path $outputDirectory 'bread-cloths-render-report.json')
}
