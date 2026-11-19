# Direct 3D film tools on Windows

The film projects render with the local AutoMovie checkout and the FFmpeg executable installed by `pnpm install`. The English soundtracks share offline Piper voices. The Korean broadcast uses the installed Korean voice specified in its production. Each film's acceptance record identifies its mix and render.

## English voices

Restore these files under `.cache/film-release-0.3.0/stock-voices/` from the workspace root. The model configuration maps cast speaker IDs to voices. The production's sound script assigns those IDs to its lines.

| Source | Local file or directory | SHA-256 |
| --- | --- | --- |
| [Piper for Windows AMD64](https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip) | Extract the ZIP here to create `piper/piper.exe` with its DLLs and language data | `f3c58906402b24f3a96d92145f58acba6d86c9b5db896d207f78dc80811efcea` (ZIP) |
| [VCTK medium model](https://huggingface.co/rhasspy/piper-voices/resolve/04ca88f5685ca5253c701af3687e155b113bd512/en/en_GB/vctk/medium/en_GB-vctk-medium.onnx) | `en_GB-vctk-medium.onnx` | `4e9fc85ab9009385319fc6bae7f55577f8a2d7ee77fd9159a5500eb6531f41e6` |
| [Model configuration](https://huggingface.co/rhasspy/piper-voices/resolve/04ca88f5685ca5253c701af3687e155b113bd512/en/en_GB/vctk/medium/en_GB-vctk-medium.onnx.json) | `en_GB-vctk-medium.onnx.json` | `7f85e6391ed0f7f46e4abd19345929a16be931a0c9945086f96692dce2087fa8` |

These lines are synthesized for the films. The model credits the CSTR VCTK Corpus v0.92 by Junichi Yamagishi, Christophe Veaux and Kirsten MacDonald, published by the University of Edinburgh in 2019 under CC BY 4.0. [Model card](https://huggingface.co/rhasspy/piper-voices/blob/04ca88f5685ca5253c701af3687e155b113bd512/en/en_GB/vctk/medium/MODEL_CARD) · [Dataset](https://doi.org/10.7488/ds/2645) · [License](https://creativecommons.org/licenses/by/4.0/)

## Video probe

From an empty `.cache/film-release-0.3.0/media-checks/` directory, run the following PowerShell command. The probe reads stream metadata and counts frames in the multiplexed delivery.

```powershell
npm.cmd install --prefix . --ignore-scripts --no-package-lock --no-save --no-audit --no-fund '@ffprobe-installer/win32-x64@5.1.0'
```

The Windows executable is `node_modules/@ffprobe-installer/win32-x64/ffprobe.exe`. Its SHA-256 is `f28c4751e7367205267025aaf0fcfc921e34d9b7edaa46bd9c8abaf367fc9051`.
