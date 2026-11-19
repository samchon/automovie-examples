param(
    [string]$OutputDirectory = '.cache/local-0.3.0/two-hands/audio'
)

$ErrorActionPreference = 'Stop'
$production = Split-Path -Parent $PSScriptRoot
if (![IO.Path]::IsPathRooted($OutputDirectory)) { $OutputDirectory = Join-Path $production $OutputDirectory }
$takes = Join-Path $OutputDirectory 'takes'
[IO.Directory]::CreateDirectory($takes) | Out-Null
$mixer = Join-Path $PSScriptRoot 'two-hands-audio.mts'
$ffmpeg = Join-Path $production 'node_modules/ffmpeg-static/ffmpeg.exe'
if (!(Test-Path -LiteralPath $ffmpeg -PathType Leaf)) { throw 'Install the production dependencies for the bundled FFmpeg.' }

& node $mixer cues $OutputDirectory
if ($LASTEXITCODE -ne 0) { throw 'Could not derive the spoken cues from the screenplay.' }
$cues = Get-Content -LiteralPath (Join-Path $OutputDirectory 'speech-cues.json') -Raw -Encoding utf8 | ConvertFrom-Json
$speaker = New-Object -ComObject SAPI.SpVoice
$korean = @($speaker.GetVoices() | Where-Object { $_.GetDescription() -like '*Heami*' }) | Select-Object -First 1
if ($null -eq $korean) { throw 'Install the Korean Microsoft Heami desktop speech voice before rendering this soundtrack.' }
$speaker.Voice = $korean
try {
    foreach ($cue in $cues) {
        $wav = Join-Path $takes ($cue.id + '.wav')
        $raw = Join-Path $takes ($cue.id + '.f32')
        $stream = New-Object -ComObject SAPI.SpFileStream
        try {
            $stream.Format.Type = 22  # 22.05 kHz, mono, 16-bit PCM.
            $stream.Open($wav, 3, $false)
            $speaker.AudioOutputStream = $stream
            $speaker.Rate = [int]$cue.rate
            $speaker.Volume = 100
            $xml = '<pitch absmiddle="' + $cue.pitch + '">' + [Security.SecurityElement]::Escape($cue.pronunciation) + '</pitch>'
            [void]$speaker.Speak($xml, 8)
        } finally {
            $stream.Close()
            [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($stream)
        }
        & $ffmpeg -hide_banner -loglevel error -y -i $wav -ar 48000 -ac 1 -f f32le $raw
        if ($LASTEXITCODE -ne 0) { throw "Failed to decode $($cue.id)." }
    }
} finally {
    [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($speaker)
}
& node $mixer mix $OutputDirectory
if ($LASTEXITCODE -ne 0) { throw 'Could not render the soundtrack.' }
