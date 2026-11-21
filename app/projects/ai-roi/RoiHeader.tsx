"use client";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "./i18n";

export default function RoiHeader() {
  const { t } = useI18n();
  return (
    <div className="print:hidden">
      <Link href="/projects" className="inline-block font-tech text-sm text-fg/60 hover:text-fg transition-colors mb-8">
        {t("← Всички проекти")}
      </Link>
      <PageHeader
        eyebrow={t("Проекти · Инструмент")}
        title={t("ИИ ROI калкулатор")}
        intro={t(
          "Изградете бизнес казуса за ИИ инициатива: опишете какво струва и какво връща, задайте колко бързо хората я възприемат и колко сте уверени — и вижте как ROI, NPV и откупуването се обновяват в реално време.",
        )}
      />
    </div>
  );
}
