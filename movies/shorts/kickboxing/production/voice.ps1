param([string]$VoiceDirectory = "../../../.cache/film-release-0.3.0/stock-voices", [string]$OutDirectory = ".cache/sound-sol/lines")
$ErrorActionPreference='Stop'
$voiceRoot=(Resolve-Path -LiteralPath $VoiceDirectory).Path
$target=[IO.Path]::GetFullPath((Join-Path (Get-Location).Path $OutDirectory))
[IO.Directory]::CreateDirectory($target)|Out-Null
$engine=Join-Path $voiceRoot 'piper/piper.exe'
$model=Join-Path $voiceRoot 'en_GB-vctk-medium.onnx'
$digest=(Get-FileHash -LiteralPath $model).Hash
if($digest -ne '4e9fc85ab9009385319fc6bae7f55577f8a2d7ee77fd9159a5500eb6531f41e6'){throw "Model did not match the approved British voice: $digest"}
$words=@('Fight!','Break!','Down!','Neutral corner!','One!','Two!','Three!','Four!','Five!','Six!','Seven!','Eight!','Nine!','Ten!','Owen!','Stay there, Marek.')
$packets=@(for($i=0;$i -lt $words.Count;$i++){[ordered]@{text=$words[$i];speaker_id=95;output_file=(Join-Path $target ("daniel-{0:00}.wav" -f $i))}|ConvertTo-Json -Compress})
$OutputEncoding=[Text.UTF8Encoding]::new($false)
$packets | & $engine --model $model --speaker 95 --json-input
if($LASTEXITCODE){throw "Piper exited $LASTEXITCODE."}
foreach($i in 0..15){$f=Get-Item -LiteralPath (Join-Path $target ("daniel-{0:00}.wav" -f $i));if($f.Length -lt 1000){throw "Incomplete voice $i"}}
$record=[ordered]@{system='Piper 2023.11.14-2';model='en_GB-vctk-medium.onnx';sha256=$digest;voice=95;stockSpeaker='p226';revision='04ca88f5685ca5253c701af3687e155b113bd512';source='University of Edinburgh CSTR VCTK Corpus, CC BY 4.0';lines=$words}
[IO.File]::WriteAllText((Join-Path $target 'voice.json'),($record|ConvertTo-Json -Depth 4),[Text.UTF8Encoding]::new($false))
$record|ConvertTo-Json -Compress
