import { supabase, type Project } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { ArrowIcon } from "@/components/Icons";

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
  "in-progress": "In progress",
  planned: "Planned",
};

const statusStyle: Record<string, string> = {
  live: "border-sage/40 text-sage",
  "in-progress": "border-[#d9b98a]/40 text-[#d9b98a]",
  planned: "border-line text-fg/50",
};

export default async function Projects() {
  const projects = await getProjects();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
      <PageHeader
        eyebrow="Work"
        title="Projects"
        intro="Things I've built, am building, or plan to build. Mostly AI, mostly useful."
      />

      {projects.length === 0 ? (
        <EmptyState message="Project write-ups are on their way." />
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const Wrapper = project.url ? "a" : "div";
            return (
              <li key={project.id}>
                <Wrapper
                  {...(project.url && { href: project.url, target: "_blank", rel: "noopener noreferrer" })}
                  className={`group flex flex-col h-full bg-card border border-line rounded-2xl p-6 sm:p-7 ${
                    project.url ? "hover:border-fg/40 transition-colors" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="font-tech text-xl font-semibold text-fg">{project.name}</h2>
                    <span className={`shrink-0 font-tech text-xs px-2.5 py-1 rounded-full border ${statusStyle[project.status] ?? statusStyle.planned}`}>
                      {statusLabel[project.status] ?? project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="font-casual text-fg/70 leading-relaxed mb-5 flex-1">{project.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-4 mt-auto">
                    {project.tags && project.tags.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {project.tags.map((tag) => (
                          <span key={tag} className="font-tech text-xs text-fg/55 border border-line rounded-full px-2.5 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : <span />}
                    {project.url && (
                      <ArrowIcon size={18} className="shrink-0 text-fg/40 group-hover:text-fg transition-colors" />
                    )}
                  </div>
                </Wrapper>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
