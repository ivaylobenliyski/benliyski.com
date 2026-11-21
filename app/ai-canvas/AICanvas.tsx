"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./AICanvas.module.css";

type BlockId =
  | "partners"
  | "inputs"
  | "outputs"
  | "value"
  | "skills"
  | "trainers"
  | "users"
  | "resources"
  | "channels"
  | "costs"
  | "revenue";

type Meta = { designedBy: string; designedFor: string; version: string; date: string };
type CanvasData = { meta: Meta; blocks: Record<BlockId, string> };

const BLOCKS: { id: BlockId; label: string; hint: string }[] = [
  { id: "partners", label: "Key Partners", hint: "Who do you need? Data providers, tech vendors, domain experts, integrators." },
  { id: "inputs", label: "Inputs", hint: "What data feeds the AI? Sources, formats, volume, quality." },
  { id: "outputs", label: "Outputs", hint: "What does the AI produce? Predictions, classifications, content, decisions." },
  { id: "value", label: "Value Proposition", hint: "What problem does it solve, for whom — and why is AI the right answer?" },
  { id: "skills", label: "Skills", hint: "What expertise does the team need? ML, data engineering, domain, product." },
  { id: "trainers", label: "Trainers", hint: "Who labels data, trains, evaluates and corrects the model?" },
  { id: "users", label: "Users and Buyers", hint: "Who uses it day to day, and who signs the cheque? Often not the same person." },
  { id: "resources", label: "Key Resources", hint: "Compute, proprietary data, models, IP, people." },
  { id: "channels", label: "Channels", hint: "How does it reach users? App, API, integration, sales team." },
  { id: "costs", label: "Costs", hint: "Data acquisition, compute & inference, talent, monitoring, maintenance." },
  { id: "revenue", label: "Revenue", hint: "How does it make or save money? Pricing model, savings, new revenue streams." },
];

const STORAGE_KEY = "ai-canvas:v1";

const emptyData = (): CanvasData => ({
  meta: { designedBy: "", designedFor: "", version: "", date: "" },
  blocks: Object.fromEntries(BLOCKS.map((b) => [b.id, ""])) as Record<BlockId, string>,
});

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "ai-canvas"
  );
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- PNG rendering ---------- */

const PNG = {
  W: 2400,
  H: 1620,
  pad: 60,
  paper: "#F3E9D7",
  ink: "#16302B",
  accent: "#9DBFA8",
  muted: "#6b5d48",
};

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    if (!para.trim()) {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
        continue;
      }
      if (line) out.push(line);
      // Hard-break words longer than the box
      let w = word;
      while (ctx.measureText(w).width > maxWidth && w.length > 1) {
        let i = w.length;
        while (i > 1 && ctx.measureText(w.slice(0, i)).width > maxWidth) i--;
        out.push(w.slice(0, i));
        w = w.slice(i);
      }
      line = w;
    }
    out.push(line);
  }
  return out;
}

function drawBlockText(
  ctx: CanvasRenderingContext2D,
  font: string,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!text.trim()) return;
  // Shrink to fit, then truncate as a last resort
  let size = 26;
  let lines: string[] = [];
  while (size >= 15) {
    ctx.font = `${size}px ${font}`;
    lines = wrapLines(ctx, text, w);
    if (lines.length * size * 1.35 <= h) break;
    size -= 1;
  }
  const lh = size * 1.35;
  const max = Math.floor(h / lh);
  if (lines.length > max) {
    lines = lines.slice(0, max);
    lines[max - 1] = lines[max - 1].replace(/.{0,2}$/, "") + "…";
  }
  ctx.fillStyle = PNG.ink;
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
}

function renderPng(data: CanvasData, font: string): string {
  const { W, H, pad } = PNG;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = PNG.paper;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = PNG.ink;
  ctx.textBaseline = "middle";
  ctx.font = `600 54px ${font}`;
  ctx.fillText("The AI Business Model Canvas", pad, 120);

  // Meta boxes
  const metaBoxes: { label: string; value: string; x: number; w: number }[] = [
    { label: "Designed by", value: data.meta.designedBy, x: 1180, w: 440 },
    { label: "Designed for", value: data.meta.designedFor, x: 1640, w: 440 },
  ];
  for (const m of metaBoxes) {
    ctx.fillStyle = PNG.accent;
    ctx.fillRect(m.x, 50, m.w, 150);
    ctx.fillStyle = PNG.ink;
    ctx.textBaseline = "top";
    ctx.font = `600 22px ${font}`;
    ctx.fillText(m.label, m.x + 16, 64);
    ctx.fillStyle = PNG.paper;
    ctx.fillRect(m.x + 12, 98, m.w - 24, 90);
    drawBlockText(ctx, font, m.value, m.x + 24, 108, m.w - 48, 72);
  }
  // Version / date
  const vx = 2100;
  const vw = W - pad - vx;
  ctx.fillStyle = PNG.accent;
  ctx.fillRect(vx, 50, vw, 150);
  ctx.fillStyle = PNG.ink;
  ctx.font = `600 20px ${font}`;
  ctx.textBaseline = "top";
  ctx.fillText("Version", vx + 14, 58);
  ctx.fillText("Date", vx + 14, 126);
  ctx.fillStyle = PNG.paper;
  ctx.fillRect(vx + 10, 84, vw - 20, 36);
  ctx.fillRect(vx + 10, 152, vw - 20, 36);
  ctx.fillStyle = PNG.ink;
  ctx.font = `22px ${font}`;
  ctx.fillText(data.meta.version.slice(0, 18), vx + 18, 91);
  ctx.fillText(data.meta.date.slice(0, 18), vx + 18, 159);

  // Grid geometry: 6 equal columns, 2 top rows, 1 bottom row
  const gx = pad;
  const gy = 240;
  const gw = W - pad * 2;
  const cw = gw / 6;
  const rowH = 470;
  const bottomH = 340;
  const rect = (col: number, row: number, cols: number, rows: number) => {
    const y = row < 2 ? gy + row * rowH : gy + 2 * rowH;
    const h = row < 2 ? rows * rowH : bottomH;
    return { x: gx + col * cw, y, w: cols * cw, h };
  };
  const layout: Record<BlockId, ReturnType<typeof rect>> = {
    partners: rect(0, 0, 1, 2),
    inputs: rect(1, 0, 1, 1),
    outputs: rect(1, 1, 1, 1),
    value: rect(2, 0, 1, 2),
    skills: rect(3, 0, 1, 1),
    trainers: rect(3, 1, 1, 1),
    users: rect(4, 0, 1, 2),
    resources: rect(5, 0, 1, 1),
    channels: rect(5, 1, 1, 1),
    costs: rect(0, 2, 3, 1),
    revenue: rect(3, 2, 3, 1),
  };

  ctx.strokeStyle = PNG.ink;
  ctx.lineWidth = 3;
  for (const b of BLOCKS) {
    const r = layout[b.id];
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = PNG.ink;
    ctx.textBaseline = "top";
    ctx.font = `600 30px ${font}`;
    ctx.fillText(b.label, r.x + 20, r.y + 18);
    drawBlockText(ctx, font, data.blocks[b.id], r.x + 20, r.y + 66, r.w - 40, r.h - 84);
  }

  ctx.fillStyle = PNG.muted;
  ctx.font = `18px ${font}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "right";
  ctx.fillText(
    "The AI Business Model Canvas © 2018 Christopher Lomas  ·  filled in at benliyski.com/ai-canvas",
    W - pad,
    H - 26,
  );

  return c.toDataURL("image/png");
}

/* ---------- Component ---------- */

export default function AICanvas() {
  const [data, setData] = useState<CanvasData>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Restore from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CanvasData>;
        const base = emptyData();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
        setData({
          meta: { ...base.meta, ...parsed.meta },
          blocks: { ...base.blocks, ...parsed.blocks },
        });
      }
    } catch {
      /* storage unavailable — start blank */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, loaded]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  const setMeta = (k: keyof Meta, v: string) => setData((d) => ({ ...d, meta: { ...d.meta, [k]: v } }));
  const setBlock = (k: BlockId, v: string) => setData((d) => ({ ...d, blocks: { ...d.blocks, [k]: v } }));

  const filename = slugify(data.meta.designedFor || "ai-canvas");

  const downloadPng = async () => {
    await document.fonts?.ready;
    const font = getComputedStyle(document.body).fontFamily || "sans-serif";
    triggerDownload(renderPng(data, font), `${filename}.png`);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.json`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<CanvasData>;
      if (!parsed || typeof parsed !== "object" || !parsed.blocks) throw new Error();
      const base = emptyData();
      setData({ meta: { ...base.meta, ...parsed.meta }, blocks: { ...base.blocks, ...parsed.blocks } });
      setNotice("Canvas loaded");
    } catch {
      setNotice("That file isn't a saved canvas");
    }
  };

  const clearAll = () => {
    if (confirm("Clear the whole canvas? This can't be undone.")) {
      setData(emptyData());
      setNotice("Canvas cleared");
    }
  };

  const btn =
    "inline-flex items-center gap-2 font-tech text-sm font-semibold px-4 py-2.5 rounded-full transition-colors";

  return (
    <div>
      {/* Toolbar */}
      <div className="print:hidden flex flex-wrap items-center gap-3 mb-6">
        <button onClick={downloadPng} className={`${btn} bg-fg text-bg hover:bg-white`}>
          Download PNG
        </button>
        <button onClick={() => window.print()} className={`${btn} border border-fg/30 text-fg hover:border-fg`}>
          Save as PDF
        </button>
        <button onClick={downloadJson} className={`${btn} border border-fg/30 text-fg hover:border-fg`}>
          Export JSON
        </button>
        <button onClick={() => fileRef.current?.click()} className={`${btn} border border-fg/30 text-fg hover:border-fg`}>
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = "";
          }}
        />
        <button onClick={clearAll} className={`${btn} text-fg/60 hover:text-fg`}>
          Clear
        </button>
        <span className="font-tech text-xs text-sage ml-auto" role="status" aria-live="polite">
          {notice || (loaded ? "Autosaved in this browser" : "")}
        </span>
      </div>

      {/* Sheet */}
      <section className={styles.sheet} aria-label="AI Business Model Canvas">
        <div className={styles.head}>
          <h2 className={styles.title}>The AI Business Model Canvas</h2>
          <div className={styles.metaRow}>
            <MetaField label="Designed by" value={data.meta.designedBy} onChange={(v) => setMeta("designedBy", v)} />
            <MetaField label="Designed for" value={data.meta.designedFor} onChange={(v) => setMeta("designedFor", v)} />
            <div className={`${styles.metaBox} ${styles.metaSmall}`}>
              <MetaInline label="Version" value={data.meta.version} onChange={(v) => setMeta("version", v)} />
              <MetaInline label="Date" type="date" value={data.meta.date} onChange={(v) => setMeta("date", v)} />
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {BLOCKS.map((b) => (
            <label key={b.id} className={styles.block} style={{ gridArea: b.id }}>
              <span className={styles.blockLabel}>{b.label}</span>
              <textarea
                className={styles.textarea}
                value={data.blocks[b.id]}
                placeholder={b.hint}
                onChange={(e) => setBlock(b.id, e.target.value)}
              />
              <span className={styles.printText}>{data.blocks[b.id]}</span>
            </label>
          ))}
        </div>

        <p className={styles.credit}>
          The AI Business Model Canvas © 2018 Christopher Lomas. Fillable version at benliyski.com/ai-canvas.
        </p>
      </section>

      <p className="print:hidden font-casual italic text-sm text-fg/55 mt-5 max-w-2xl">
        Your canvas never leaves your device — it&apos;s stored only in this browser. Export JSON to keep a copy
        or move it to another machine. For “Save as PDF”, choose <em>Save as PDF</em> as the printer.
      </p>
    </div>
  );
}

function MetaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className={styles.metaBox}>
      <span className={styles.metaLabel}>{label}</span>
      <textarea className={styles.metaInput} rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      <span className={styles.printText}>{value}</span>
    </label>
  );
}

function MetaInline({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className={styles.metaInline}>
      <span className={styles.metaLabel}>{label}</span>
      <input className={styles.metaInputSmall} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
