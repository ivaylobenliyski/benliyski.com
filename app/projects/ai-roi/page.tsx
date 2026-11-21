import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ROICalculator from "./ROICalculator";

export const metadata = {
  title: "AI ROI Calculator — Ivaylo Benliyski",
  description:
    "Model the return on an AI initiative: custom cost and benefit types, driver-based benefits, adoption ramp, risk adjustment, scenarios, NPV, IRR and payback.",
};

export default function AIROIPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24 print:p-0 print:max-w-none">
      <div className="print:hidden">
        <Link href="/projects" className="inline-block font-tech text-sm text-fg/60 hover:text-fg transition-colors mb-8">
          ← All projects
        </Link>
        <PageHeader
          eyebrow="Projects · Tool"
          title="AI ROI Calculator"
          intro="Build the business case for an AI initiative: list what it costs and what it returns, set how fast people adopt it and how confident you are — and see ROI, NPV and payback update as you go."
        />
      </div>
      <ROICalculator />
    </div>
  );
}
