param([string]$Work=".cache/local-0.3.0/the-better-seat/sound",[string]$Output="media/automovie/the-better-seat/audios/the-better-seat.wav",[string]$Voices="../../../.cache/film-release-0.3.0/stock-voices")
$ErrorActionPreference="Stop"
[IO.Directory]::CreateDirectory((Join-Path (Get-Location) $Work))|Out-Null
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName((Join-Path (Get-Location) $Output)))|Out-Null
$piper=(Resolve-Path (Join-Path $Voices "piper/piper.exe")).Path
$model=(Resolve-Path (Join-Path $Voices "en_GB-vctk-medium.onnx")).Path
$lines=@(
  "You laughed yesterday. Ride home on it?",
  "First man out gets this split seat. Winner takes mine?",
  "My word on it.",
  "I was out. The split one's mine.",
  "Ride with me to Milan? I've done that road alone enough."
)
$cast=@(95,82,95,82,82)
for($i=0;$i -lt $lines.Count;$i++){
  $file=Join-Path (Resolve-Path $Work) ("line"+$i+".wav")
  $lines[$i] | & $piper --model $model --speaker $cast[$i] --output_file $file --length_scale 1.10
  if($LASTEXITCODE -ne 0){throw "Voice line $i failed"}
}
& python (Join-Path $PSScriptRoot "sound.py") $Work $Output
exit $LASTEXITCODE
