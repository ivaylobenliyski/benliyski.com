/** A tiny 16×16 greyscale picture (a heart) shared by the vision-model demos. 0 = black, 255 = white. */

const ROWS = [
  "................",
  "................",
  "................",
  "....###..###....",
  "...####..####...",
  "..############..",
  "..############..",
  "..############..",
  "...##########...",
  "....########....",
  ".....######.....",
  "......####......",
  ".......##.......",
  "................",
  "................",
  "................",
];

export const SIZE = 16;

export const HEART: number[][] = ROWS.map((row, y) =>
  row.split("").map((ch, x) => {
    if (ch === ".") return 24;
    // a soft highlight in the upper-left lobe so the picture isn't flat
    const d = Math.hypot(x - 4.5, y - 5);
    return Math.round(Math.max(150, 235 - d * 9));
  }),
);

/** Deterministic pseudo-random numbers so server and browser render the same noise. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
