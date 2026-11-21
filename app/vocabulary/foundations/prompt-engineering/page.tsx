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
import PromptBuilder from "@/components/foundations/prompt-engineering/PromptBuilder";
import StepByStep from "@/components/foundations/prompt-engineering/StepByStep";
import { HeroArt, PromptAnatomy, Techniques } from "@/components/foundations/prompt-engineering/Figures";
import MythOrFact, { type MythOrFactItem } from "@/components/foundations/MythOrFact";
import { topicHref } from "@/lib/foundations";
import { SOURCES } from "./data";

const PATH = topicHref("prompt-engineering");
const TITLE = "Prompt Engineering: How to Get Better Answers From AI";
const DESCRIPTION =
  "Prompt engineering in plain language: why wording changes AI answers, the parts of a good prompt (build one yourself), examples, structure, step-by-step reasoning, what changes with reasoning models, and the limits — with sources.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "why", label: "Why wording matters" },
  { id: "build", label: "Build a better prompt" },
  { id: "techniques", label: "Six techniques that work" },
  { id: "examples", label: "Show, don't just tell" },
  { id: "think", label: "Give it room to think" },
  { id: "limits", label: "What prompting can't fix" },
  { id: "myths", label: "Myth or fact?" },
  { id: "sources", label: "Sources" },
];

export default function PromptEngineering() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const mythOrFact: MythOrFactItem[] = [
    {
      statement: "There are secret magic words that unlock much better answers.",
      isMyth: true,
      explanation: <>The official guides from AI labs point to plain good communication: clear instructions, context, examples and structure — not secret phrases.{c("anthropic-guide", "openai-guide")}</>,
    },
    {
      statement: "Adding “Let's think step by step” once raised a model's maths score from about 18% to 79%.",
      isMyth: false,
      explanation: <>In a 2022 study, that one sentence took an OpenAI model from 17.7% to 78.7% on the MultiArith word-problem test.{c("zero-shot-cot")}</>,
    },
    {
      statement: "The longer the prompt, the better the answer.",
      isMyth: true,
      explanation: <>Relevant detail helps; irrelevant detail can hurt. Researchers found models&apos; maths accuracy dropped sharply when problems included distracting, irrelevant information.{c("distracted")}</>,
    },
    {
      statement: "Every model needs to be told to think step by step.",
      isMyth: true,
      explanation: <>Reasoning models already work through problems before answering, and OpenAI&apos;s guide says they do well with simple prompts. The old trick matters most for non-reasoning models.{c("reasoning-guide")}</>,
    },
    {
      statement: "A few examples in your prompt can teach a model a new task without retraining it.",
      isMyth: false,
      explanation: <>This “few-shot” ability was a headline finding of the GPT-3 paper in 2020 — and it&apos;s still one of the most reliable techniques.{c("gpt3")}</>,
    },
    {
      statement: "With a good enough prompt, the answer is guaranteed to be correct.",
      isMyth: true,
      explanation: <>Prompts reduce mistakes but can&apos;t eliminate them. Models can still state false things confidently, so check facts that matter.{c("hallucinate")}</>,
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

      <Breadcrumb title="Prompt engineering" />
      <ArticleHero
        eyebrow="Foundations · AI in the world"
        title={TITLE}
        intro="The same AI can give you a bland answer or a brilliant one. The difference is usually the prompt — and the skills behind a good one are learnable in ten minutes."
        readingMinutes={9}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>A <strong className="text-fg">prompt</strong> is everything you give the model: instructions, context, examples and documents.</>,
              <>Good prompts remove guesswork: say <strong className="text-fg">who it&apos;s for, what you want and what good looks like</strong>.</>,
              <><strong className="text-fg">Examples</strong> and <strong className="text-fg">room to think</strong> are two of the most reliable boosts.</>,
              <>No prompt makes a model infallible — <strong className="text-fg">check what matters</strong>.</>,
            ]}
          />

          <Section id="why" kicker="The idea" title="Why wording changes the answer">
            <p>
              A {link("language-models", "language model")}{" "}writes the most fitting continuation of what it&apos;s given. Everything you
              leave out, it has to guess — and its guess is usually the most generic option. <strong>Prompt engineering</strong>{" "}is simply
              the skill of giving it what it needs so it doesn&apos;t have to guess.
            </p>
            <p>
              The AI labs&apos; own guides agree on the basics: be clear and direct, give context, show examples, structure long prompts and
              let the model think through hard problems.{c("anthropic-guide", "openai-guide")}
            </p>
          </Section>

          <Section id="build" kicker="Try it" title="Build a better prompt">
            <p>Start with a vague request, then add one ingredient at a time and see how the answer changes:</p>
          </Section>
          <Figure wide caption="Answers written for this demo to show the typical pattern, not output from a real model. The prompt-building advice itself follows the AI labs' guides.">
            <PromptBuilder />
          </Figure>
          <div className="mb-16 md:mb-20" />

          <Section id="techniques" kicker="The toolkit" title="Six techniques that work">
            <Figure wide caption="Distilled from Anthropic's and OpenAI's prompt-engineering guides.">
              <Techniques />
            </Figure>
            <p>Put together, a solid everyday prompt often has five parts. You won&apos;t always need all of them:</p>
            <Figure caption="An example prompt, broken into its parts. Even adding just context and format makes a big difference.">
              <PromptAnatomy />
            </Figure>
          </Section>

          <Section id="examples" kicker="Few-shot prompting" title="Show, don't just tell">
            <p>
              One of the most surprising findings of the 2020 GPT-3 paper was that a model could pick up a new task from just a few examples
              in the prompt — no retraining needed. This is called <strong>few-shot prompting</strong>.{c("gpt3")}
            </p>
            <Callout label="In practice">
              Want replies in your company&apos;s voice, or data in a particular layout? Paste two or three examples of exactly what you want.
              It&apos;s often faster and more precise than describing the style in words.
            </Callout>
          </Section>

          <Section id="think" kicker="Try it" title="Give it room to think">
            <p>
              In 2022, Google researchers showed that prompting models with worked, step-by-step examples greatly improved their reasoning
              on maths problems.{c("cot")}{" "}Another team found that simply adding “Let&apos;s think step by step” raised one model&apos;s score on a
              maths word-problem test from 17.7% to 78.7%.{c("zero-shot-cot")}{" "}Try the effect on a classic trick question:
            </p>
          </Section>
          <Figure wide caption="Answers written for this demo to show the effect described in the research. Many of today's models answer this particular question correctly either way.">
            <StepByStep />
          </Figure>
          <div className="mb-16 md:mb-20 font-casual text-[17px] md:text-lg text-fg/80 leading-relaxed">
            <Callout label="What changed with reasoning models">
              Newer <strong className="text-fg">reasoning models</strong>{" "}are trained to think before they answer, so you rarely need to ask.
              OpenAI&apos;s guide notes they do well with simple, direct prompts. Focus on a clear goal and the right context instead.{c("reasoning-guide")}
            </Callout>
          </div>

          <Section id="limits" kicker="Be realistic" title="What prompting can't fix">
            <p>
              More isn&apos;t always better. Researchers found that adding irrelevant information to maths problems made models noticeably
              worse at solving them, so keep prompts focused.{c("distracted")}{" "}And even a perfect prompt doesn&apos;t guarantee a correct
              answer: models can still state false things confidently.{c("hallucinate")}
            </p>
            <p>
              Prompts work in both directions, too. Text the model reads — a web page, an email, a document you paste in — can contain
              instructions of its own, an attack called prompt injection.{c("injection")}{" "}That matters most when models act for you; see{" "}
              {link("ai-agents", "AI agents")} and {link("ai-safety", "AI safety")}.
            </p>
          </Section>

          <Section id="myths" kicker="Fact check" title="Myth or fact?">
            <p>Six statements about prompting. Some are true, some are popular misconceptions. Can you tell which is which?</p>
            <MythOrFact items={mythOrFact} />
          </Section>

          <Takeaways
            items={[
              "A prompt is all the instructions, context and examples you give the model.",
              "Say who it's for, what you want, and what good looks like.",
              "Examples and step-by-step thinking are reliable boosts; reasoning models need less nudging.",
              "Keep prompts focused, and always check facts that matter.",
            ]}
          />
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <KeepGoing slug="prompt-engineering" />

      <div className="max-w-3xl mt-16">
        <Sources sources={SOURCES} />
      </div>
    </div>
  );
}
