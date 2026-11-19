/**
 * The fixed 30 fps picture and dialogue clock. Approximate beats use the
 * authored action's onset; the signed programme anchors do not move.
 * The motion overlays, sound mix, captions and export share these values.
 * See docs/body/screenplay/kickboxing/020-the-round.md#p11 for the fall and count
 * and docs/body/screenplay/kickboxing/020-the-round.md#p12 for the closing cues.
 */
export const roundClock = {
  duration: 180,
  fps: 30,
  touch: 2.03,
  guardCrack: 65.50,
  redReply: 97.85,
  redSole: 111.45,
  redPush: 112.35,
  blueAnswer: 116.20,
  knockdown: 150,
  canvasTouch: 150.65,
  countReady: 157,
  result: 167.6,
  glovesUp: 168.1,
  bell: 170.1,
  victoryStamps: [170.95, 171.65],
  mayaClaps: [65.95, 66.60, 99.35, 178.50],
  ruthClaps: [66.60, 179.50],
  joClaps: [114.25, 114.90, 115.55],
  edClaps: [114.25, 114.90, 115.55, 118.10],
  pavelClap: 142.65,
  lines: [
    [0.45, 0.47, -0.04, 0.70],
    [37.05, 0.54, -0.05, 0.81],
    [150.65, 0.48, -0.22, 0.82],
    [152.00, 0.82, -0.28, 0.80],
    [158, 0.73, -0.21, 0.82],
    [159, 0.73, -0.21, 0.82],
    [160, 0.73, -0.21, 0.82],
    [161, 0.73, -0.21, 0.82],
    [162, 0.73, -0.21, 0.82],
    [163, 0.73, -0.21, 0.82],
    [164, 0.73, -0.21, 0.82],
    [165, 0.73, -0.21, 0.82],
    [166, 0.73, -0.21, 0.82],
    [167, 0.50, -0.21, 0.82],
    [167.65, 0.75, -0.18, 0.78],
    [172.48, 1.07, -0.22, 0.57],
  ],
} as const;
