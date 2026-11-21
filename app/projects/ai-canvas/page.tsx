import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AICanvas from "./AICanvas";

export const metadata = {
  title: "AI Business Model Canvas — Ivaylo Benliyski",
  description:
    "A fillable AI Business Model Canvas. Map partners, data, value, skills and money for your AI product — then download it as PNG, PDF or JSON.",
};

export default function AICanvasPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24 print:p-0 print:max-w-none">
      <div className="print:hidden">
        <Link href="/projects" className="inline-block font-tech text-sm text-fg/60 hover:text-fg transition-colors mb-8">
          ← All projects
        </Link>
        <PageHeader
          eyebrow="Projects · Tool"
          title="AI Business Model Canvas"
          intro="A one-page strategy map for an AI product. Fill in each block, it saves in your browser as you type, and download it when you're done."
        />
      </div>
      <AICanvas />
    </div>
  );
}
