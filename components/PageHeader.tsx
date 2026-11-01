export default function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <header className="mb-12 md:mb-16">
      <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-4">{eyebrow}</p>
      <h1 className="font-tech text-4xl md:text-6xl font-bold tracking-tight text-fg mb-5 text-balance">
        {title}
      </h1>
      <p className="font-casual text-lg md:text-xl text-fg/70 italic max-w-2xl leading-relaxed text-pretty">
        {intro}
      </p>
    </header>
  );
}
