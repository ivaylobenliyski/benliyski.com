"use client";
import { useEffect, useRef, useState } from "react";

/* A tiny, honest machine-learning demo: fit a straight line to made-up data
   with plain gradient descent on the mean squared error. */

const XS = [0.5, 1.5, 2, 3, 3.5, 4.5, 5.5, 6, 7, 7.5, 8.5, 9.5];
const YS = [40.8, 55.2, 51, 61.5, 55.2, 68.8, 78.2, 72, 81.5, 78.2, 92.8, 93.2];
const MEAN_X = XS.reduce((a, b) => a + b, 0) / XS.length;

// The model works with hours centred on the mean (keeps gradient descent well-behaved);
// we show the reader the usual slope + intercept.
type Params = { w: number; b: number };
const START: Params = { w: 0, b: 50 };

const RATES = {
  small: { lr: 0.005, label: "Too small", note: "Each step is tiny. It gets there — eventually." },
  good: { lr: 0.06, label: "Just right", note: "Big enough to move fast, small enough not to overshoot." },
  big: { lr: 0.15, label: "Too big", note: "Each step overshoots the target, and the error explodes." },
} as const;
type Rate = keyof typeof RATES;

const predict = (p: Params, x: number) => p.w * (x - MEAN_X) + p.b;
const loss = (p: Params) => XS.reduce((s, x, i) => s + (predict(p, x) - YS[i]) ** 2, 0) / XS.length;

function step(p: Params, lr: number): Params {
  let gw = 0;
  let gb = 0;
  XS.forEach((x, i) => {
    const e = predict(p, x) - YS[i];
    gw += e * (x - MEAN_X);
    gb += e;
  });
  return { w: p.w - (lr * 2 * gw) / XS.length, b: p.b - (lr * 2 * gb) / XS.length };
}

// chart coordinates
const W = 360;
const H = 240;
const PAD = { l: 34, r: 10, t: 10, b: 28 };
const X_MAX = 10;
const Y_MIN = 20;
const Y_MAX = 110;
const sx = (x: number) => PAD.l + (x / X_MAX) * (W - PAD.l - PAD.r);
const sy = (y: number) => PAD.t + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);

export default function TrainingPlayground() {
  const [p, setP] = useState<Params>(START);
  const [rate, setRate] = useState<Rate>("good");
  const [history, setHistory] = useState<number[]>([loss(START)]);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pRef = useRef<Params>(START);

  const apply = (next: Params, fresh = false) => {
    pRef.current = next;
    setP(next);
    setHistory((h) => (fresh ? [loss(next)] : [...h, loss(next)].slice(-60)));
  };

  const current = loss(p);
  const diverged = !Number.isFinite(current) || current > 1e6;
  const slope = p.w;
  const intercept = p.b - p.w * MEAN_X;

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  };
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const doStep = () => {
    const next = step(pRef.current, RATES[rate].lr);
    apply(next);
    const l = loss(next);
    if (!Number.isFinite(l) || l > 1e6) stop();
  };

  const train = () => {
    stop();
    setRunning(true);
    let n = 0;
    timer.current = setInterval(() => {
      doStep();
      if (++n >= 40) stop();
    }, 70);
  };

  const reset = () => {
    stop();
    apply(START, true);
  };

  const setManual = (s: number, i: number) => {
    stop();
    apply({ w: s, b: i + s * MEAN_X }, true);
  };

  // loss sparkline (log scale so both huge and small errors are visible)
  const lg = history.map((l) => Math.log10(Math.max(1, Math.min(l, 1e7))));
  const maxLg = Math.max(3, ...lg);
  const spark = lg
    .map((v, i) => `${(i / Math.max(1, history.length - 1)) * 200},${50 - (v / maxLg) * 46}`)
    .join(" ");

  const lineY0 = predict(p, 0);
  const lineY1 = predict(p, X_MAX);

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8">
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Scatter plot of practice hours against test scores, with the model's current line">
          <defs>
            <clipPath id="tp-clip">
              <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} />
            </clipPath>
          </defs>
          {[40, 60, 80, 100].map((y) => (
            <g key={y}>
              <line x1={PAD.l} x2={W - PAD.r} y1={sy(y)} y2={sy(y)} stroke="var(--line)" strokeWidth="0.75" />
              <text x={PAD.l - 6} y={sy(y) + 3.5} textAnchor="end" fontSize="9" fill="var(--fg)" opacity="0.45" fontFamily="var(--font-space-grotesk)">{y}</text>
            </g>
          ))}
          {[0, 2, 4, 6, 8, 10].map((x) => (
            <text key={x} x={sx(x)} y={H - 12} textAnchor="middle" fontSize="9" fill="var(--fg)" opacity="0.45" fontFamily="var(--font-space-grotesk)">{x}</text>
          ))}
          <text x={(W + PAD.l) / 2} y={H - 1} textAnchor="middle" fontSize="9" fill="var(--fg)" opacity="0.6" fontFamily="var(--font-space-grotesk)">hours of practice →</text>

          <g clipPath="url(#tp-clip)">
            {/* errors */}
            {XS.map((x, i) => (
              <line key={x} x1={sx(x)} x2={sx(x)} y1={sy(YS[i])} y2={sy(predict(p, x))} stroke="#e3a08a" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.8" />
            ))}
            <line x1={sx(0)} y1={sy(lineY0)} x2={sx(X_MAX)} y2={sy(lineY1)} stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {XS.map((x, i) => (
            <circle key={x} cx={sx(x)} cy={sy(YS[i])} r="4" fill="var(--fg)" />
          ))}
          <text x={PAD.l + 4} y={PAD.t + 10} fontSize="9" fill="var(--fg)" opacity="0.6" fontFamily="var(--font-space-grotesk)">test score</text>
        </svg>
        <p className="mt-2 font-tech text-xs text-fg/50 leading-relaxed">
          Dots = examples (made-up data). Green line = the model&apos;s current guess. Dashed red = how wrong it is for each example.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-1">Average error</p>
          <p className={`font-tech text-3xl font-bold tabular-nums ${diverged ? "text-[#e3a08a]" : "text-fg"}`} aria-live="polite">
            {diverged ? "∞ — blew up" : current.toFixed(1)}
          </p>
          <svg viewBox="0 0 200 52" className="w-full h-12 mt-1" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={spark} fill="none" stroke={diverged ? "#e3a08a" : "var(--sage)"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="font-tech text-[11px] text-fg/40">Error over training steps (log scale)</p>
        </div>

        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-2">Step size (“learning rate”)</p>
          <div role="group" aria-label="Learning rate" className="flex flex-wrap gap-2">
            {(Object.keys(RATES) as Rate[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={rate === k}
                onClick={() => setRate(k)}
                className={`font-tech text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                  rate === k ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"
                }`}
              >
                {RATES[k].label}
              </button>
            ))}
          </div>
          <p className="mt-2 font-casual text-sm text-fg/60">{RATES[rate].note}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={train} disabled={running} className="font-tech text-sm font-semibold bg-fg text-bg px-5 py-2.5 rounded-full hover:bg-white disabled:opacity-60 transition-colors">
            {running ? "Training…" : "Train 40 steps"}
          </button>
          <button type="button" onClick={doStep} disabled={running} className="font-tech text-sm px-4 py-2.5 rounded-full border border-line text-fg/80 hover:border-fg/50 disabled:opacity-50">
            1 step
          </button>
          <button type="button" onClick={reset} className="font-tech text-sm px-4 py-2.5 rounded-full border border-line text-fg/80 hover:border-fg/50">
            Reset
          </button>
        </div>

        <details className="group rounded-xl border border-line px-4 py-3">
          <summary className="cursor-pointer font-tech text-sm text-fg/75 list-none flex justify-between">
            Or try it by hand <span className="text-fg/40 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="flex justify-between font-tech text-sm text-fg/70 mb-1">
                <span>Points per hour (slope)</span>
                <span className="tabular-nums text-fg">{diverged ? "—" : slope.toFixed(1)}</span>
              </span>
              <input type="range" min={-5} max={12} step={0.1} value={diverged ? 0 : Math.max(-5, Math.min(12, slope))} onChange={(e) => setManual(Number(e.target.value), intercept)} className="w-full accent-[var(--sage)] h-6" />
            </label>
            <label className="block">
              <span className="flex justify-between font-tech text-sm text-fg/70 mb-1">
                <span>Score with 0 hours (start)</span>
                <span className="tabular-nums text-fg">{diverged ? "—" : intercept.toFixed(1)}</span>
              </span>
              <input type="range" min={0} max={100} step={0.5} value={diverged ? 50 : Math.max(0, Math.min(100, intercept))} onChange={(e) => setManual(slope, Number(e.target.value))} className="w-full accent-[var(--sage)] h-6" />
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}
