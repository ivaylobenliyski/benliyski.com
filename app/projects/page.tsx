export const metadata = {
  title: "Projects — Ivaylo Benliyski",
  description: "Side projects and experiments I've built.",
};

const projects = [
  {
    name: "AI Daily Digest",
    description:
      "An automated pipeline that curates AI news daily and delivers it straight to WhatsApp via Claude API and Twilio.",
    status: "live" as const,
    tags: ["AI", "Automation", "Python"],
    url: null,
  },
];

const statusLabel = {
  live: "Live",
  "in-progress": "In Progress",
  planned: "Planned",
};

const statusColor = {
  live: "bg-emerald-900/50 text-emerald-300 border-emerald-700/40",
  "in-progress": "bg-amber-900/50 text-amber-300 border-amber-700/40",
  planned: "bg-[#F3E9D7]/5 text-[#F3E9D7]/40 border-[#F3E9D7]/10",
};

export default function Projects() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-14">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-3">
          Work
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-[#F3E9D7] mb-4">
          Projects
        </h1>
        <p className="font-[family-name:var(--font-lora)] text-lg text-[#F3E9D7]/60 italic max-w-xl leading-relaxed">
          Things I&apos;ve built, am building, or plan to build. Mostly AI, mostly useful.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {projects.map((project) => (
          <li key={project.name}>
            <div className="bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[#F3E9D7]">
                  {project.name}
                </h2>
                <span
                  className={`shrink-0 font-[family-name:var(--font-space-grotesk)] text-xs px-2.5 py-1 rounded-full border ${statusColor[project.status]}`}
                >
                  {statusLabel[project.status]}
                </span>
              </div>
              <p className="font-[family-name:var(--font-lora)] text-sm text-[#F3E9D7]/60 leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex items-center gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 border border-[#F3E9D7]/10 rounded-full px-2.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
