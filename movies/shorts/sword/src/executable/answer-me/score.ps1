param(
  [string]$MediaRoot = "media/automovie/answer-me",
  [string]$VoiceAssets = "../../../.cache/film-release-0.3.0/stock-voices"
)
$ErrorActionPreference = "Stop"
$cache = [IO.Directory]::CreateDirectory((Join-Path (Get-Location) ".cache/sol-0.3.0/answer-me/voice"))
$destination = [IO.Directory]::CreateDirectory((Join-Path (Get-Location) "$MediaRoot/audio"))
$resolvedAssets = (Resolve-Path -LiteralPath $VoiceAssets).Path
$synth = Join-Path $resolvedAssets "piper/piper.exe"
$model = Join-Path $resolvedAssets "en_GB-vctk-medium.onnx"
$OutputEncoding = [Text.UTF8Encoding]::new($false)
$voices = @(
  @("luc", "You swore. Her foal needs her.", 95, "0.94"),
  @("remy", "No horse, no pay.", 82, "0.95"),
  @("clerk", "You swore too, Luc.", 74, "1.02"),
  @("road", "Bring her back!", 95, "0.96"),
  @("stop", "Don't move.", 95, "0.98")
)
foreach($line in $voices){
  $wav = Join-Path $cache.FullName ($line[0] + ".wav")
  $line[1] | & $synth --model $model --speaker $line[2] --length_scale $line[3] --noise_scale 0 --noise_w 0 --output_file $wav
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
node (Join-Path $PSScriptRoot "mix.mjs") $cache.FullName (Join-Path $destination.FullName "answer-me.wav")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
