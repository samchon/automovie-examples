"""Extract chronological audience sheets and event frames from the delivered MP4."""

import argparse
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat

FPS = 24
FRAME_COUNT = 1440
EVENTS = {
    "opening": 0,
    "thumb wiggle": 144,
    "first cut": 360,
    "first report": 400,
    "bench knock": 408,
    "heel near score": 560,
    "second report": 629,
    "coat catch": 660,
    "knee lands": 727,
    "extra boot": 780,
    "third beat": 816,
    "lad's close view": 822,
    "lad sees boot": 836,
    "print beyond score": 851,
    "Martin sees print": 869,
    "lad about to speak": 882,
    "Carlo speaks": 891,
    "return to yard view": 924,
    "Carlo sets prop down": 997,
    "Martin sets prop down": 1025,
    "fine saddle lifts": 1040,
    "offered hand": 1059,
    "fine saddle passes": 1085,
    "return to bench view": 1094,
    "fourth beat": 1104,
    "split saddle lifts": 1138,
    "invitation": 1230,
    "doorway close view": 1324,
    "first fingers": 1331,
    "bench and doorway": 1351,
    "shared gesture": 1354,
    "Martin's laugh": 1378,
    "shared view returns": 1398,
    "laugh and sitting": 1414,
    "end": 1439,
}


def make_sheet(paths, frames, title, output):
    """Label each frame with its zero-based index and encoded presentation time."""
    columns, tile_w, tile_h, heading, caption = 5, 352, 198, 36, 25
    rows = (len(frames) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * tile_w, heading + rows * (tile_h + caption)), "#151613")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype("arial.ttf", 17)
    draw.text((10, 7), title, font=font, fill="#f3eee4")
    for index, (path, frame) in enumerate(zip(paths, frames, strict=True)):
        left = index % columns * tile_w
        top = heading + index // columns * (tile_h + caption)
        with Image.open(path) as source:
            sheet.paste(source.resize((tile_w, tile_h), Image.Resampling.LANCZOS), (left, top))
        draw.text((left + 8, top + tile_h + 2), f"Frame {frame:04}  {frame / FPS:06.3f} s", font=font, fill="#f3eee4")
    sheet.save(output, quality=88, subsampling=0)


def paired_frames(output, source, decoded):
    """Read the same frame number from source and delivery, then report RGB changes."""
    result = []
    entries = list(EVENTS.items())
    for index in range(0, len(entries), 5):
        group = entries[index:index + 5]
        sheet = Image.new("RGB", (1120, 35 + 340 * len(group)), "#151613")
        draw = ImageDraw.Draw(sheet)
        font = ImageFont.truetype("arial.ttf", 17)
        draw.text((10, 7), "AutoMovie source / decoded MP4", font=font, fill="#f3eee4")
        for row, (label, frame) in enumerate(group):
            source_file = source / f"frame_{frame:05}.png"
            if not source_file.is_file():
                raise FileNotFoundError(source_file)
            with Image.open(source_file) as source_image, Image.open(decoded[frame]) as delivery_image:
                a, b = source_image.convert("RGB"), delivery_image.convert("RGB")
            difference = ImageChops.difference(a, b)
            mean_absolute_error = ImageStat.Stat(difference).mean
            top = 35 + 340 * row
            sheet.paste(a.resize((560, 315), Image.Resampling.LANCZOS), (0, top))
            sheet.paste(b.resize((560, 315), Image.Resampling.LANCZOS), (560, top))
            draw.text((8, top + 317), f"{frame:04}  {frame / FPS:06.3f} s   {label}", font=font, fill="#f3eee4")
            result.append({"event": label, "frame": frame, "meanAbsoluteRgbDifference": mean_absolute_error})
        sheet.save(output / f"paired-{index // 5 + 1:02}.jpg", quality=88, subsampling=0)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("ffmpeg", type=Path)
    parser.add_argument("film", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--source", type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    stills = args.output / "decoded"
    stills.mkdir(exist_ok=True)

    regular = [second * FPS + step for second in range(60) for step in (0, 5, 10, 14, 19)]
    nearby = {frame for event in EVENTS.values() for frame in range(event - 2, event + 3) if 0 <= frame < FRAME_COUNT}
    requested = sorted(set(regular) | nearby)
    expression = "+".join(f"eq(n,{frame})" for frame in requested)
    command = [
        str(args.ffmpeg), "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(args.film), "-map", "0:v:0", "-vf", f"select='{expression}'",
        "-fps_mode", "passthrough", "-threads", "2", str(stills / "frame-%04d.png"),
    ]
    subprocess.run(command, check=True)
    files = [stills / f"frame-{index + 1:04}.png" for index in range(len(requested))]
    if not files[-1].is_file() or (stills / f"frame-{len(files) + 1:04}.png").exists():
        raise SystemExit(f"Expected {len(files)} decoded stills")
    by_index = dict(zip(requested, files, strict=True))

    for number, index in enumerate(range(0, len(regular), 25), 1):
        frames = regular[index:index + 25]
        make_sheet([by_index[n] for n in frames], frames, "The Better Seat | whole film, five stills per second", args.output / f"audience-{number:02}.jpg")
    event_items = list(EVENTS.items())
    for number, index in enumerate(range(0, len(event_items), 5), 1):
        group = event_items[index:index + 5]
        frames = [n for _, event in group for n in range(event - 2, event + 3) if n in nearby]
        title = "The Better Seat | " + " / ".join(name for name, _ in group)
        make_sheet([by_index[n] for n in frames], frames, title, args.output / f"events-{number:02}.jpg")

    record = {
        "film": str(args.film),
        "sampledFrames": regular,
        "eventFrames": EVENTS,
        "decodedStills": {str(index): str(file.relative_to(args.output)) for index, file in by_index.items()},
    }
    if args.source:
        record["sourceComparisons"] = paired_frames(args.output, args.source, by_index)
    (args.output / "frames.json").write_text(json.dumps(record, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
