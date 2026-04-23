import { supabase, type Project } from "@/lib/supabase";

export const metadata = {
  title: "Projects — Ivaylo Benliyski",
  description: "Side projects and experiments I've built.",
};

export const revalidate = 60;

async function getProjects(): Promise<Project[]> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}

const statusLabel: Record<string, string> = {
  live: "Live",
  "in-progress": "In Progress",
  planned: "Planned",
};

const statusColor: Record<string, string> = {
  live: "bg-emerald-900/50 text-emerald-300 border-emerald-700/40",
  "in-progress": "bg-amber-900/50 text-amber-300 border-amber-700/40",
  planned: "bg-[#F3E9D7]/5 text-[#F3E9D7]/40 border-[#F3E9D7]/10",
};

export default async function Projects() {
  const projects = await getProjects();

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

      {projects.length === 0 ? (
        <div className="border border-dashed border-[#F3E9D7]/20 rounded-2xl p-12 text-center">
          <p className="font-[family-name:var(--font-lora)] text-[#F3E9D7]/40 italic">
            Projects coming soon.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {projects.map((project) => (
            <li key={project.id}>
              <div className="bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[#F3E9D7]">
                    {project.url ? (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        {project.name}
                      </a>
                    ) : project.name}
                  </h2>
                  <span className={`shrink-0 font-[family-name:var(--font-space-grotesk)] text-xs px-2.5 py-1 rounded-full border ${statusColor[project.status] ?? statusColor.planned}`}>
                    {statusLabel[project.status] ?? project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="font-[family-name:var(--font-lora)] text-sm text-[#F3E9D7]/60 leading-relaxed mb-4">
                    {project.description}
                  </p>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {project.tags.map((tag) => (
                      <span key={tag} className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 border border-[#F3E9D7]/10 rounded-full px-2.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
