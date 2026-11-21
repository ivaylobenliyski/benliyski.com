"use client";
import { useState } from "react";
import type { YearRow } from "./model";
import { useI18n } from "./i18n";

export const COLOR_BENEFIT = "#3B8FC0";
export const COLOR_COST = "#D46E47";

const W = 420;
const H = 230;
const M = { top: 14, right: 8, bottom: 26, left: 52 };

function niceStep(range: number) {
  const raw = range / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/** Net cash flow per year (bars, signed) + cumulative position (line), on one shared axis. */
export default function CashFlowChart({ rows, fmt, fmtShort }: { rows: YearRow[]; fmt: (n: number) => string; fmtShort: (n: number) => string }) {
  const { t } = useI18n();
  const [hover, setHover] = useState<number | null>(null);

  const values = rows.flatMap((r) => [r.net, r.cumulative, 0]);
  const step = niceStep(Math.max(...values) - Math.min(...values));
  const max = Math.ceil(Math.max(...values) / step) * step || step;
  const min = Math.floor(Math.min(...values) / step) * step;
  const ticks: number[] = [];
  for (let t = min; t <= max + step / 2; t += step) ticks.push(t);

  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const y = (v: number) => M.top + ((max - v) / (max - min || 1)) * ih;
  const band = iw / rows.length;
  const cx = (i: number) => M.left + band * i + band / 2;
  const barW = Math.min(44, band * 0.45);
  const zero = y(0);

  const line = rows.map((r, i) => `${i ? "L" : "M"}${cx(i)},${y(r.cumulative)}`).join(" ");
  const h = hover !== null ? rows[hover] : null;

  return (
    <figure className="relative m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={t("Нетен паричен поток и кумулативна позиция по години")}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={t === 0 ? 0.45 : 0.1} strokeWidth={1} />
            <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="12" fill="currentColor" fillOpacity={0.55}>
              {fmtShort(t)}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const top = Math.min(y(r.net), zero);
          const hgt = Math.max(1, Math.abs(y(r.net) - zero));
          const pos = r.net >= 0;
          const rad = Math.min(4, hgt / 2, barW / 2);
          // Rounded only on the data end, square at the baseline
          const x0 = cx(i) - barW / 2;
          const d = pos
            ? `M${x0},${top + hgt} V${top + rad} Q${x0},${top} ${x0 + rad},${top} H${x0 + barW - rad} Q${x0 + barW},${top} ${x0 + barW},${top + rad} V${top + hgt} Z`
            : `M${x0},${top} V${top + hgt - rad} Q${x0},${top + hgt} ${x0 + rad},${top + hgt} H${x0 + barW - rad} Q${x0 + barW},${top + hgt} ${x0 + barW},${top + hgt - rad} V${top} Z`;
          return (
            <g key={r.year}>
              <path d={d} fill={pos ? COLOR_BENEFIT : COLOR_COST} opacity={hover === null || hover === i ? 1 : 0.55} />
              <text x={cx(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.65}>
                {r.year === 0 ? t("Старт") : `${t("Г")}${r.year}`}
              </text>
            </g>
          );
        })}
        <path d={line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
        {rows.map((r, i) => (
          <circle key={r.year} cx={cx(i)} cy={y(r.cumulative)} r={hover === i ? 5 : 4} fill="currentColor" stroke="var(--card)" strokeWidth={2} />
        ))}
        {rows.map((r, i) => (
          <rect
            key={r.year}
            x={M.left + band * i}
            y={M.top}
            width={band}
            height={ih}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setHover(hover === i ? null : i)}
          />
        ))}
      </svg>

      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-lg border border-line bg-bg/95 px-3 py-2 font-tech text-xs shadow-lg whitespace-nowrap min-w-[11rem]"
          style={{ left: `${(cx(hover) / W) * 100}%`, transform: `translateX(${hover > rows.length / 2 ? "-105%" : "5%"})` }}
        >
          <p className="font-semibold text-fg mb-1">{h.year === 0 ? t("Старт (година 0)") : `${t("Година")} ${h.year}`}</p>
          <p className="flex justify-between gap-4 text-fg/70">{t("Ползи")} <span className="text-fg tabular-nums">{fmt(h.benefits)}</span></p>
          <p className="flex justify-between gap-4 text-fg/70">{t("Разходи")} <span className="text-fg tabular-nums">{fmt(h.costs)}</span></p>
          <p className="flex justify-between gap-4 text-fg/70">{t("Нето")} <span className="text-fg tabular-nums">{fmt(h.net)}</span></p>
          <p className="flex justify-between gap-4 text-fg/70">{t("Кумулативно")} <span className="text-fg tabular-nums">{fmt(h.cumulative)}</span></p>
        </div>
      )}

      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 mt-2 font-tech text-xs text-fg/65">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR_BENEFIT }} />{t("Нетна печалба за годината")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR_COST }} />{t("Нетен разход за годината")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-fg" />{t("Кумулативна позиция")}</span>
      </figcaption>
    </figure>
  );
}
