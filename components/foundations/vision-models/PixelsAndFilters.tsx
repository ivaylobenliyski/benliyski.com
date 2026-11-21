"use client";
import { useMemo, useState } from "react";
import { HEART, SIZE } from "./image";

/* Real 3×3 convolution running on a tiny image — the operation a convolutional
   network's first layer performs, with filters it typically ends up learning. */

const FILTERS = {
  none: { label: "Original", kernel: null, note: "The picture as the computer stores it: one brightness number per pixel." },
  vertical: {
    label: "Vertical edges",
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
    note: "Lights up where brightness changes left-to-right — the heart's sides.",
  },
  horizontal: {
    label: "Horizontal edges",
    kernel: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
    note: "Lights up where brightness changes top-to-bottom — the top and the bottom tip.",
  },
  blur: {
    label: "Blur",
    kernel: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    note: "Averages each pixel with its neighbours, smoothing out detail.",
  },
} as const;
type FilterKey = keyof typeof FILTERS;

function convolve(img: number[][], k: readonly (readonly number[])[], absolute: boolean, divisor: number) {
  const at = (y: number, x: number) => img[Math.min(SIZE - 1, Math.max(0, y))][Math.min(SIZE - 1, Math.max(0, x))];
  const raw = img.map((row, y) =>
    row.map((_, x) => {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += k[dy + 1][dx + 1] * at(y + dy, x + dx);
      return absolute ? Math.abs(s) : s / divisor;
    }),
  );
  const max = Math.max(1, ...raw.flat());
  return raw.map((row) => row.map((v) => Math.round(absolute ? (v / max) * 255 : v)));
}

export default function PixelsAndFilters() {
  const [filter, setFilter] = useState<FilterKey>("none");
  const [numbers, setNumbers] = useState(false);
  const f = FILTERS[filter];

  const out = useMemo(() => {
    if (!f.kernel) return HEART;
    return filter === "blur" ? convolve(HEART, f.kernel, false, 9) : convolve(HEART, f.kernel, true, 1);
  }, [f, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div role="group" aria-label="Apply a filter" className="flex flex-wrap gap-2">
          {(Object.keys(FILTERS) as FilterKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              className={`font-tech text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                filter === k ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"
              }`}
            >
              {FILTERS[k].label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 font-tech text-sm text-fg/70 cursor-pointer select-none">
          <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} className="accent-[var(--sage)] w-4 h-4" />
          Show the numbers
        </label>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <div
          className="grid w-full max-w-[460px] mx-auto md:mx-0 aspect-square rounded-xl overflow-hidden border border-line"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`A 16 by 16 pixel heart, ${f.label.toLowerCase()}`}
        >
          {out.flat().map((v, i) => (
            <div
              key={i}
              className="flex items-center justify-center font-mono leading-none transition-colors duration-300"
              style={{
                backgroundColor: `rgb(${v},${v},${v})`,
                color: v > 128 ? "#16302B" : "#F3E9D7",
                fontSize: "clamp(5px, 1.55vw, 9px)",
              }}
            >
              {numbers ? v : ""}
            </div>
          ))}
        </div>

        <div className="md:w-[220px]">
          {f.kernel ? (
            <>
              <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-2">The 3×3 filter</p>
              <div className="inline-grid grid-cols-3 gap-1 mb-3">
                {f.kernel.flat().map((v, i) => (
                  <span
                    key={i}
                    className={`w-10 h-10 rounded-md flex items-center justify-center font-mono text-sm ${
                      v > 0 ? "bg-sage/30 text-fg" : v < 0 ? "bg-[#e3a08a]/25 text-fg" : "bg-card text-fg/50"
                    }`}
                  >
                    {v}
                  </span>
                ))}
              </div>
              <p className="font-casual text-sm text-fg/65 leading-relaxed">
                Slide it over every pixel: multiply the 9 numbers underneath by these, add them up, write the result.
              </p>
            </>
          ) : (
            <p className="font-casual text-sm text-fg/65 leading-relaxed">
              256 pixels, each a number from 0 (black) to 255 (white). A colour photo stores three numbers per pixel — red, green and blue.
            </p>
          )}
          <p className="mt-4 font-casual text-[15px] text-fg leading-relaxed" aria-live="polite">{f.note}</p>
        </div>
      </div>
    </div>
  );
}
