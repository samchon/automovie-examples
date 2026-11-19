param(
    [ValidateSet("gpu", "software")]
    [string]$Backend = "gpu",
    [string]$Picture = "",
    [string]$Sound = "media/automovie/the-better-seat/audios/the-better-seat.wav",
    [string]$Output = "media/automovie/the-better-seat/videos/the-better-seat.mp4"
)

$ErrorActionPreference = "Stop"
$production = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "../..")).Path
Push-Location -LiteralPath $production
try {
    if (!$Picture) {
        $pictureFolder = ".cache/the-better-seat/picture"
        & node ./node_modules/automovie/bin.mts render --module src/subjects.ts --subject the-better-seat --backend $Backend --out $pictureFolder
        if ($LASTEXITCODE -ne 0) { throw "AutoMovie picture render failed." }
        $Picture = Join-Path $pictureFolder "film.mp4"
    }
    $pictureFile = (Resolve-Path -LiteralPath $Picture).Path
    $soundFile = (Resolve-Path -LiteralPath $Sound).Path
    $film = [IO.Path]::GetFullPath($Output, $production)
    $outputFolder = Split-Path -Parent $film
    [IO.Directory]::CreateDirectory($outputFolder) | Out-Null
    $partial = Join-Path $outputFolder ".mux-$PID.mp4"
    $ffmpeg = & node -p "require('ffmpeg-static')"
    if ($LASTEXITCODE -ne 0) { throw "The production's FFmpeg is unavailable." }

    & $ffmpeg -hide_banner -loglevel error -y -i $pictureFile -i $soundFile -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart -metadata "title=The Better Seat" $partial
    if ($LASTEXITCODE -ne 0) { throw "FFmpeg could not assemble the film." }
    [IO.File]::Move($partial, $film, $true)
    Get-Item -LiteralPath $film
} finally {
    if ($partial -and (Test-Path -LiteralPath $partial)) { Remove-Item -LiteralPath $partial }
    Pop-Location
}
