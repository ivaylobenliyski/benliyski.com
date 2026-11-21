import Link from "next/link";
import { Manrope, Space_Grotesk } from "next/font/google";
import PageHeader from "@/components/PageHeader";
import ROICalculator from "./ROICalculator";

export const metadata = {
  title: "ИИ ROI калкулатор — Ivaylo Benliyski",
  description:
    "Изчислете възвръщаемостта на ИИ инициатива: собствени типове разходи и ползи, ползи по двигатели, крива на внедряване, корекция за риск, сценарии, NPV, IRR и откупуване.",
};

// Space Grotesk has no Cyrillic glyphs; Manrope fills them in, letter for letter, while Latin stays in Space Grotesk.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap" });
const cyrillic = Manrope({ subsets: ["cyrillic"], display: "swap" });
const techFont = `${spaceGrotesk.style.fontFamily.split(",")[0]}, ${cyrillic.style.fontFamily}, sans-serif`;

export default function AIROIPage() {
  return (
    <div
      lang="bg"
      className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24 print:p-0 print:max-w-none"
      style={{ ["--font-space-grotesk" as string]: techFont, fontFamily: techFont }}
    >
      <div className="print:hidden">
        <Link href="/projects" className="inline-block font-tech text-sm text-fg/60 hover:text-fg transition-colors mb-8">
          ← Всички проекти
        </Link>
        <PageHeader
          eyebrow="Проекти · Инструмент"
          title="ИИ ROI калкулатор"
          intro="Изградете бизнес казуса за ИИ инициатива: опишете какво струва и какво връща, задайте колко бързо хората я възприемат и колко сте уверени — и вижте как ROI, NPV и откупуването се обновяват в реално време."
        />
      </div>
      <ROICalculator />
    </div>
  );
}
