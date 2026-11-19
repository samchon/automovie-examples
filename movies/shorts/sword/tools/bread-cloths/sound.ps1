param(
  [string]$OutputDirectory = ".cache/sol-0.3.0/bread-cloths/sound-v2",
  [string]$Voices = "../../../.cache/film-release-0.3.0/stock-voices",
  [string]$Publish = "media/automovie/bread-cloths/audio/bread-cloths.wav"
)

$ErrorActionPreference = 'Stop'
$folder = [IO.Path]::GetFullPath($OutputDirectory)
[IO.Directory]::CreateDirectory($folder) | Out-Null
$piper = (Resolve-Path (Join-Path $Voices 'piper/piper.exe')).Path
$model = (Resolve-Path (Join-Path $Voices 'en_GB-vctk-medium.onnx')).Path
$config = Get-Content "$model.json" -Raw | ConvertFrom-Json

# The English lines use four stock voices. Perrin uses the same voice for both of his lines.
$lines = @(
  @{ Name = 'woman';  Speaker = 'p248'; Pace = '0.93'; Text = 'Alix! How much?' },
  @{ Name = 'alix';   Speaker = 'p225'; Pace = '0.97'; Text = 'Enough for both tables!' },
  @{ Name = 'perrin'; Speaker = 'p226'; Pace = '0.94'; Text = "You'll have her and the bread. My word." },
  @{ Name = 'caller'; Speaker = 'p243'; Pace = '0.90'; Text = "That's the rye you saw them load, lad!" },
  @{ Name = 'here';   Speaker = 'p226'; Pace = '0.96'; Text = "I'm here." }
)

foreach ($line in $lines) {
  $speakerId = $config.speaker_id_map.($line.Speaker)
  if ($null -eq $speakerId) { throw "Missing VCTK voice $($line.Speaker)" }
  $file = Join-Path $folder ($line.Name + '.wav')
  $line.Text | & $piper --model $model --speaker $speakerId --length_scale $line.Pace --output_file $file
  if ($LASTEXITCODE -ne 0) { throw "Voice synthesis failed for $($line.Name)" }
}

& python (Join-Path $PSScriptRoot 'sound.py') $folder
if ($LASTEXITCODE -ne 0) { throw "The soundtrack mixer exited $LASTEXITCODE" }
$soundtrack = [IO.Path]::GetFullPath($Publish)
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($soundtrack)) | Out-Null
Copy-Item -LiteralPath (Join-Path $folder 'road-stereo.wav') -Destination $soundtrack
