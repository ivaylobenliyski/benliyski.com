import type { Metadata } from "next";
import Link from "next/link";
import {
  ArticleHero,
  Breadcrumb,
  Callout,
  Cite,
  Figure,
  KeepGoing,
  OnThisPage,
  Section,
  Sources,
  Takeaways,
  TLDR,
} from "@/components/foundations/ArticleParts";
import RewardDemo from "@/components/foundations/ai-safety/RewardDemo";
import RiskLadder from "@/components/foundations/ai-safety/RiskLadder";
import { DefenceLayers, FeatureFigure, HarmsMap, HeroArt } from "@/components/foundations/ai-safety/Figures";
import MythOrFact, { type MythOrFactItem } from "@/components/foundations/MythOrFact";
import { topicHref } from "@/lib/foundations";
import { SOURCES } from "./data";

const PATH = topicHref("ai-safety");
const TITLE = "AI Safety Explained: Risks, Alignment and How We Keep AI in Check";
const DESCRIPTION =
  "AI safety in plain language: today's harms like bias, made-up answers and deepfakes, the alignment problem (try the reward demo), how models are trained and tested, looking inside AI, the EU AI Act's risk levels, and the debate over future risks — with sources.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "what", label: "What AI safety covers" },
  { id: "alignment", label: "The alignment problem" },
  { id: "training", label: "Teaching good behaviour" },
  { id: "inside", label: "Looking inside" },
  { id: "rules", label: "Rules and oversight" },
  { id: "debate", label: "The big debate" },
  { id: "you", label: "What you can do" },
  { id: "myths", label: "Myth or fact?" },
  { id: "sources", label: "Sources" },
];

export default function AISafety() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const mythOrFact: MythOrFactItem[] = [
    {
      statement: "AI safety is only about science-fiction robots taking over.",
      isMyth: true,
      explanation: <>Most of the work deals with problems happening now — bias, made-up answers, privacy, scams and misuse — alongside longer-term questions.{c("intl-report")}</>,
    },
    {
      statement: "An AI once learned to rack up points in a boat race by driving in circles instead of finishing.",
      isMyth: false,
      explanation: <>In 2016, an OpenAI agent rewarded for hitting targets found a lagoon where targets kept reappearing, and circled it rather than completing the race.{c("coastrunners")}</>,
    },
    {
      statement: "If an AI does exactly what it was told, it's doing what we wanted.",
      isMyth: true,
      explanation: <>The boat-race agent did exactly what its reward said. The gap between what we specify and what we mean is the core of the alignment problem.{c("coastrunners")}</>,
    },
    {
      statement: "Nobody can see anything at all inside an AI model.",
      isMyth: true,
      explanation: <>Interpretability research has found millions of recognisable “features” inside a production model — including one for the Golden Gate Bridge that researchers could turn up and down.{c("monosemanticity")}</>,
    },
    {
      statement: "Under EU law, some uses of AI are banned outright.",
      isMyth: false,
      explanation: <>The EU AI Act prohibits a short list of practices, such as social scoring, and sets strict rules for high-risk uses like recruitment.{c("eu-ai-act")}</>,
    },
    {
      statement: "AI experts all agree on how dangerous AI is.",
      isMyth: true,
      explanation: <>They don&apos;t. An international report by around 100 experts highlights real disagreements, and prominent researchers sit on both sides of the debate about extreme risks.{c("intl-report", "cais-coverage")}</>,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    url: `https://benliyski.com${PATH}`,
    dateModified: CHECKED,
    author: { "@type": "Person", name: "Ivaylo Benliyski", url: "https://benliyski.com/about" },
    isPartOf: { "@type": "CreativeWorkSeries", name: "Foundations: What is AI?", url: "https://benliyski.com/vocabulary/foundations" },
    citation: SOURCES.map((s) => s.url),
  };

  const link = (slug: string, text: string) => (
    <Link href={topicHref(slug)} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
      {text}
    </Link>
  );

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Breadcrumb title="AI safety" />
      <ArticleHero
        eyebrow="Foundations · AI in the world"
        title={TITLE}
        intro="Not just killer robots. AI safety is about making sure systems do what we actually mean — fairly, honestly and under human control — today and as they get more capable."
        readingMinutes={12}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>AI safety covers <strong className="text-fg">harms happening now</strong> (bias, made-up answers, deepfakes, misuse) and <strong className="text-fg">risks further ahead</strong>.</>,
              <>The core technical problem is <strong className="text-fg">alignment</strong>: AI pursues what we reward, which isn&apos;t always what we mean.</>,
              <>Defences come in <strong className="text-fg">layers</strong>: training, testing, safeguards, and rules like the EU AI Act.</>,
              <>Experts <strong className="text-fg">genuinely disagree</strong> about the size of long-term risks — be wary of anyone who says it&apos;s settled.</>,
            ]}
          />

          <Section id="what" kicker="The scope" title="What AI safety covers">
            <p>
              “AI safety” is a broad label. In January 2025, an international report written by around 100 AI experts, chaired by Turing
              Award winner Yoshua Bengio, set out the risks from today&apos;s general-purpose AI — from malicious use and malfunctions to
              wider effects on society — and noted where experts still disagree.{c("intl-report")}
            </p>
            <Figure wide caption="A simplified map of the risks discussed in this guide. The right-hand column is where experts disagree most.">
              <HarmsMap />
            </Figure>
            <p>
              Many of today&apos;s harms appear elsewhere on this map: face-analysis systems that worked far worse for darker-skinned women,{c("gender-shades")}{" "}
              chatbots that state false things confidently,{c("hallucinate")} and models that can repeat personal data from their training
              text.{c("carlini")}
            </p>
          </Section>

          <Section id="alignment" kicker="Try it" title="The alignment problem">
            <p>
              Machine learning systems optimise whatever they are rewarded for. <strong>Alignment</strong> means making sure that matches what
              we actually want. It sounds easy, until a system finds a loophole. In 2016, OpenAI trained an agent to play a boat-racing game,
              rewarding it for points from hitting targets. Try both rewards:{c("coastrunners")}
            </p>
          </Section>
          <Figure wide caption="An illustrative recreation of the real 2016 case described by OpenAI. The original agent circled a lagoon of respawning targets, crashing and catching fire, but still out-scored the race.">
            <RewardDemo />
          </Figure>
          <div className="mb-16 md:mb-20 font-casual text-[17px] md:text-lg text-fg/80 leading-relaxed">
            <Callout label="Why it matters">
              A game is harmless. But the same gap — between what we can measure and what we mean — shows up in real systems: a model
              rewarded for answers people <em>like</em> can learn to tell them what they want to hear rather than what&apos;s correct.{c("sycophancy")}{" "}The more capable the system, the
              better it gets at finding loopholes.
            </Callout>
          </div>

          <Section id="training" kicker="Building in good behaviour" title="Teaching models to behave">
            <p>
              Today&apos;s chatbots are shaped after pre-training to be helpful and avoid harm. People rate model answers and the model is
              trained towards the preferred ones — <strong>reinforcement learning from human feedback</strong>.{c("instructgpt")}{" "}Anthropic&apos;s{" "}
              <strong>Constitutional AI</strong> adds a short list of written principles: the model critiques and revises its own answers
              against them, reducing the need for human labels.{c("constitutional")}
            </p>
            <p>
              Before release, models are <strong>red-teamed</strong>: people deliberately try to make them misbehave, so problems can be
              fixed first.{c("red-teaming")}{" "}No single defence is perfect, so safety relies on several layers whose gaps don&apos;t line up.
            </p>
            <Figure wide caption="The “Swiss cheese” idea from safety engineering: each layer has holes, but stacked together they stop far more problems.">
              <DefenceLayers />
            </Figure>
          </Section>

          <Section id="inside" kicker="Opening the black box" title="Looking inside the model">
            <p>
              A model&apos;s knowledge is spread across billions of weights, which makes it hard to know <em>why</em> it does something.{" "}
              <strong>Interpretability</strong> research tries to read those internals. In 2024, Anthropic reported finding millions of
              “features” inside its Claude 3 Sonnet model — patterns that respond to specific concepts.{c("monosemanticity")}
            </p>
            <Figure caption="One widely reported example from Anthropic's research. Amplifying the feature made the model bring up the bridge even when it wasn't relevant.">
              <FeatureFigure />
            </Figure>
            <p>
              Being able to find and adjust concepts like “deception” or “unsafe code” inside a model could one day help check that a system
              is safe — not just that it looks safe from the outside. The field is young, and researchers are careful about how much these
              features really explain.
            </p>
          </Section>

          <Section id="rules" kicker="Who checks?" title="Rules and oversight">
            <p>
              Leading AI companies have published <strong>frontier safety policies</strong>: dangerous-capability thresholds, tests to
              detect them, and what they commit to do if a model crosses one. The first was piloted in September 2023, and in May 2024
              sixteen companies agreed to publish such policies at the AI Seoul Summit.{c("safety-policies")}
            </p>
            <p>
              Governments are involved too. At the UK&apos;s Bletchley Park summit in November 2023, 28 countries plus the EU signed a
              declaration on managing risks from frontier AI.{c("bletchley")}{" "}The UK set up an AI Safety Institute to test models, renamed the
              AI Security Institute in February 2025.{c("aisi-rename")}{" "}The EU went furthest with a law: the{" "}
              <strong>AI Act</strong> sorts uses of AI by risk.{c("eu-ai-act")}{" "}Can you place these?
            </p>
          </Section>
          <Figure wide caption="Simplified from the EU AI Act. Real classification depends on details and context, and obligations phase in over several years.">
            <RiskLadder />
          </Figure>
          <div className="mb-16 md:mb-20" />

          <Section id="debate" kicker="Honest disagreement" title="The big debate about future risks">
            <p>
              In May 2023, hundreds of researchers and executives — including Geoffrey Hinton and the heads of OpenAI, Google DeepMind and
              Anthropic — signed a one-sentence statement: “Mitigating the risk of extinction from AI should be a global priority alongside
              other societal-scale risks such as pandemics and nuclear war.”{c("cais", "cais-coverage")}
            </p>
            <p>
              Others did not sign, including Meta&apos;s then chief AI scientist Yann LeCun,{c("cais-coverage")} and some researchers argue that talk of extinction distracts from harms happening today.{" "}
              The international report reflects this split: experts agree some risks are real and others are uncertain, and disagree on
              how likely and how soon the most serious ones are.{c("intl-report")}
            </p>
            <Callout label="A useful stance">
              You don&apos;t have to pick a side to take safety seriously. Today&apos;s harms are real and measurable, and the same tools —
              testing, transparency, oversight — help with both present and future risks.
            </Callout>
          </Section>

          <Section id="you" kicker="Everyday safety" title="What you can do">
            <ul className="space-y-2 list-none">
              {[
                "Check important facts from AI against a reliable source.",
                "Don't paste passwords, health records or confidential work into tools you don't trust.",
                "Be sceptical of shocking audio, images and video — deepfakes are cheap to make.",
                "Keep a human decision on anything that seriously affects people: hiring, money, health.",
                "Give AI agents the least access they need, and approve risky actions yourself.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="text-sage mt-0.5" aria-hidden="true">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="myths" kicker="Fact check" title="Myth or fact?">
            <p>Six statements about AI safety. Some are true, some are popular misconceptions. Can you tell which is which?</p>
            <MythOrFact items={mythOrFact} />
          </Section>

          <Takeaways
            items={[
              "AI safety spans present-day harms and debated future risks.",
              "Alignment: AI pursues what we reward, which isn't always what we mean.",
              "Safety comes in layers — training, testing, safeguards and rules.",
              "Experts disagree on long-term risk; today's harms are already measurable.",
            ]}
          />

          <p className="mb-16 font-casual text-lg text-fg/75 leading-relaxed">
            Safety matters most when AI can act on its own — see {link("ai-agents", "AI agents")}. For how training shapes behaviour, see{" "}
            {link("how-machines-learn", "How machines learn")}.
          </p>
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <KeepGoing slug="ai-safety" />

      <div className="max-w-3xl mt-16">
        <Sources sources={SOURCES} />
      </div>
    </div>
  );
}
