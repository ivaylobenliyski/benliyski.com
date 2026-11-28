/** Calendar slots in Europe/Sofia time. Calls: hourly; consultations: 10:00 and 14:00 (Sat 10:00). No Sundays. */
export function sofiaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sofia", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function freeSlots(kind: "call" | "consultation", taken: Set<string>, today: string, days = 10, limit = 8): string[] {
  const out: string[] = [];
  const d = new Date(`${today}T12:00:00Z`);
  for (let i = 0; i < days; i++) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay(); // 0 = Sunday
    if (wd === 0) continue;
    const hours = kind === "call" ? (wd === 6 ? [10, 11, 12, 13] : [9, 10, 11, 12, 13, 14, 15, 16, 17]) : wd === 6 ? [10] : [10, 14];
    for (const h of hours) {
      const slot = `${d.toISOString().slice(0, 10)} ${String(h).padStart(2, "0")}:00`;
      if (!taken.has(slot)) out.push(slot);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
