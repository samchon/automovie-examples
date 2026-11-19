import {
  AUTO_MOVIE_DRAW_GLOBALS,
  installAutoMovieDraw,
  parseAutoMovieInspectionRequest,
  type IAutoMovieDrawFunction,
} from "@automovie/render";

import { subjects } from "../src/subjects";

const width = 1280;
const height = 720;
const rate = 30;
const output = window as unknown as Record<string, unknown>;
output[AUTO_MOVIE_DRAW_GLOBALS.props] = { subject: "the-round", props: null };
installAutoMovieDraw(subjects, output);
const draw = output[AUTO_MOVIE_DRAW_GLOBALS.draw] as IAutoMovieDrawFunction;
const request = { ...parseAutoMovieInspectionRequest(() => undefined), shade: "beauty" as const };

const canvas = document.querySelector("canvas");
const context = canvas?.getContext("2d");
if (!canvas || !context) throw Error("The review image canvas is unavailable.");

/**
 * Request the film camera through the same installed draw entry used by AutoMovie capture.
 * The encoder consumes the returned tightly packed, top-first RGBA bytes in the browser.
 */
async function filmPixels(seconds: number): Promise<Uint8Array<ArrayBuffer>> {
  const { pixels } = await draw.draw({ seconds, request, view: "film", width, height, frame: [seconds], scale: 1 });
  const rgba = Uint8Array.fromBase64(pixels);
  if (rgba.byteLength !== width * height * 4) throw Error("AutoMovie returned an unexpected film raster.");
  return rgba;
}

const description = await draw.describe();
output.renderInfo = () => ({
  backend: description.renderer,
  draw: "installAutoMovieDraw/the-round/film/beauty",
  width,
  height,
  rate,
});
output.frame = async (seconds: number) => {
  const pixels = await filmPixels(seconds);
  const rgba = new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.byteLength);
  context.putImageData(new ImageData(rgba, width, height), 0, 0);
  return canvas.toDataURL("image/png").split(",")[1];
};

output.encode = async (start: number, end: number) => {
  const config: VideoEncoderConfig = {
    codec: "avc1.420028",
    width,
    height,
    framerate: rate,
    bitrate: 6_000_000,
    latencyMode: "realtime",
    avc: { format: "annexb" },
  };
  const support = await VideoEncoder.isConfigSupported(config);
  if (!support.supported) throw Error("H.264 encoder unavailable.");

  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let failure: Error | undefined;
  const encoder = new VideoEncoder({
    output: (chunk) => {
      const bytes = new Uint8Array(chunk.byteLength);
      chunk.copyTo(bytes);
      chunks.push(bytes);
    },
    error: (error) => { failure = error; },
  });
  try {
    encoder.configure(config);
    for (let index = start; index < end; index++) {
      const timestamp = Math.round(index * 1e6 / rate);
      const frame = new VideoFrame(await filmPixels(index / rate), {
        format: "RGBA",
        codedWidth: width,
        codedHeight: height,
        timestamp,
        duration: Math.round((index + 1) * 1e6 / rate) - timestamp,
      });
      try {
        encoder.encode(frame, { keyFrame: index === start || index % rate === 0 });
      } finally {
        frame.close();
      }
      if (encoder.encodeQueueSize > 8) await encoder.flush();
      if (failure) throw failure;
    }
    await encoder.flush();
    if (failure) throw failure;
  } finally {
    if (encoder.state !== "closed") encoder.close();
  }

  const packet = new Blob(chunks, { type: "application/octet-stream" });
  const receipt = await fetch(`/packet/${start}-${end}`, { method: "POST", body: packet });
  if (!receipt.ok) throw Error(`Host rejected encoded interval ${start}–${end}.`);
  return { start, end, frames: chunks.length, bytes: packet.size };
};

await filmPixels(0);
output.ready = true;
