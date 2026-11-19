$ErrorActionPreference = 'Stop'
$folder = '.cache/sol-0.3.0/native-integration'
[IO.Directory]::CreateDirectory([IO.Path]::GetFullPath($folder)) | Out-Null
$builder = @'
import { createRequire } from "node:module";
const requireFromRoot = createRequire(import.meta.url);
const requireFromVite = createRequire(requireFromRoot.resolve("vite/package.json"));
await requireFromVite("esbuild").build({
  entryPoints: ["production/native-probe.mjs"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: ".cache/sol-0.3.0/native-integration/native-probe.bundle.mjs",
  banner: { js: "import { createRequire as probeRequire } from 'node:module'; const require = probeRequire(import.meta.url);" },
});
'@
node --input-type=module -e $builder
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node "$folder/native-probe.bundle.mjs" > "$folder/native-probe.json"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$record = Get-Content -Raw -LiteralPath "$folder/native-probe.json" | ConvertFrom-Json
$record | Select-Object duration, schedule, floorRoute, refusals | ConvertTo-Json -Depth 8
