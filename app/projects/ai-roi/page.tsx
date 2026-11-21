import { Manrope, Space_Grotesk } from "next/font/google";
import { LangProvider } from "./i18n";
import RoiHeader from "./RoiHeader";
import ROICalculator from "./ROICalculator";

export const metadata = {
  title: "AI ROI Calculator · ИИ ROI калкулатор — Ivaylo Benliyski",
  description:
    "Model the return on an AI initiative, in English or Bulgarian: custom cost and benefit types, driver-based benefits, adoption ramp, risk adjustment, scenarios, NPV, IRR and payback.",
};

// Space Grotesk has no Cyrillic glyphs; Manrope fills them in, letter for letter, while Latin stays in Space Grotesk.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap" });
const cyrillic = Manrope({ subsets: ["cyrillic"], display: "swap" });
const techFont = `${spaceGrotesk.style.fontFamily.split(",")[0]}, ${cyrillic.style.fontFamily}, sans-serif`;

export default function AIROIPage() {
  return (
    <LangProvider
      className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24 print:p-0 print:max-w-none"
      style={{ ["--font-space-grotesk" as string]: techFont, fontFamily: techFont }}
    >
      <RoiHeader />
      <ROICalculator />
    </LangProvider>
  );
}
