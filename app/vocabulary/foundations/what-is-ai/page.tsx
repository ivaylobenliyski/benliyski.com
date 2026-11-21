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
import AICircles, { type Ring } from "@/components/foundations/what-is-ai/AICircles";
import IsItAI, { type QuizItem } from "@/components/foundations/what-is-ai/IsItAI";
import { FourApproaches, HeroArt, InputInferOutput, Spectrum } from "@/components/foundations/what-is-ai/Figures";
import { topicHref } from "@/lib/foundations";
import { SOURCES } from "./data";

const PATH = topicHref("what-is-ai");
const TITLE = "What Is AI? A Plain-Language Guide";
const DESCRIPTION =
  "What artificial intelligence actually means, explained simply: the official definitions, how AI, machine learning, deep learning and generative AI fit together, narrow AI vs AGI, and common myths — with sources.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "definition", label: "A working definition" },
  { id: "how-it-works", label: "What an AI system does" },
  { id: "circles", label: "AI, ML, deep learning, GenAI" },
  { id: "quiz", label: "Quiz: is it AI?" },
  { id: "approaches", label: "Four ways to define it" },
  { id: "narrow-general", label: "Narrow AI vs. AGI" },
  { id: "myths", label: "Myths vs. facts" },
  { id: "sources", label: "Sources" },
];

export default function WhatIsAI() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const rings: Ring[] = [
    {
      id: "ai",
      label: "Artificial intelligence",
      short: "Artificial intelligence (AI)",
      since: "Named in 1955",
      definition: (
        <>
          The whole field: any technique that gets machines to do things we&apos;d call intelligent if a person did them —
          reasoning, planning, understanding language, recognising what they see. It includes approaches that don&apos;t learn at all,
          like hand-written rules and brute-force search.{c("dartmouth", "aima")}
        </>
      ),
      examples: ["Chess engines", "Route planners", "Spam filters", "Chatbots"],
      note: <>Deep Blue, which beat Kasparov at chess in 1997, is AI — but not machine learning. It searched positions using hand-tuned rules.{c("deep-blue")}</>,
    },
    {
      id: "ml",
      label: "Machine learning",
      short: "Machine learning",
      since: "Term popularised in 1959",
      definition: (
        <>
          AI that <strong className="text-fg">learns patterns from examples</strong> instead of following rules a person wrote. Arthur
          Samuel&apos;s 1959 paper described a checkers program that got better by playing, and helped popularise the term.{c("samuel")}
        </>
      ),
      examples: ["Spam filters", "Fraud detection", "Recommendations", "Credit scoring"],
    },
    {
      id: "dl",
      label: "Deep learning",
      short: "Deep learning",
      since: "Took off in 2012",
      definition: (
        <>
          Machine learning with <strong className="text-fg">neural networks of many layers</strong>. Each layer learns a slightly more
          abstract view of the data — edges, then shapes, then faces.{c("deep-learning")}
        </>
      ),
      examples: ["Face unlock", "Speech recognition", "Translation", "Medical image analysis"],
    },
    {
      id: "genai",
      label: "Generative AI",
      short: "GenAI",
      since: "Mainstream since 2022",
      definition: (
        <>
          Models that <strong className="text-fg">create new content</strong> — text, images, audio, video, code — that resembles the
          data they learned from.{c("nist-genai")}
        </>
      ),
      examples: ["ChatGPT", "Claude", "Gemini", "Image generators"],
      note: <>Today&apos;s generative AI is built almost entirely with deep learning, which is why it sits inside that circle.</>,
    },
  ];

  const quiz: QuizItem[] = [
    {
      id: "thermostat",
      emoji: "🌡️",
      thing: "A thermostat that switches the heating on below 20 °C",
      isAI: false,
      verdict: "not AI",
      why: <>It follows one rule a person wrote. The EU&apos;s legal definition explicitly leaves out systems that only run rules defined by people.{c("eu-ai-act")}</>,
    },
    {
      id: "spam",
      emoji: "📧",
      thing: "Your email's spam filter",
      isAI: true,
      verdict: "AI (machine learning)",
      why: <>Modern spam filters learn from huge numbers of examples which messages are junk, and keep adapting as spammers change tactics.</>,
    },
    {
      id: "calculator",
      emoji: "🧮",
      thing: "A pocket calculator",
      isAI: false,
      verdict: "not AI",
      why: <>It runs exact, fixed procedures. Nothing is learned or inferred — the same keys always give the same answer.</>,
    },
    {
      id: "deep-blue",
      emoji: "♟️",
      thing: "Deep Blue, the 1997 chess computer",
      isAI: true,
      verdict: "AI, but not machine learning",
      why: <>Classic AI: it searched huge numbers of positions and scored them with a hand-crafted evaluation function. It didn&apos;t learn from data.{c("deep-blue")}</>,
    },
    {
      id: "recs",
      emoji: "🎧",
      thing: "“Recommended for you” on a streaming app",
      isAI: true,
      verdict: "AI (machine learning)",
      why: <>It predicts what you&apos;ll like from your history and from people with similar tastes. That&apos;s a recommendation — one of the four outputs in the definition.</>,
    },
    {
      id: "chatbot",
      emoji: "💬",
      thing: "A chatbot like ChatGPT, Claude or Gemini",
      isAI: true,
      verdict: "AI (generative)",
      why: <>All four circles at once: AI, machine learning, deep learning and generative AI. It produces new text in response to whatever you write.</>,
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

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Breadcrumb title="What is AI?" />
      <ArticleHero
        eyebrow="Foundations · The big picture"
        title={TITLE}
        intro="Everyone uses the word, few agree on what it means. Here's the clearest working answer — and how the buzzwords fit together."
        readingMinutes={9}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>AI is <strong className="text-fg">software that works out its own answers</strong> — predictions, content, recommendations or decisions — from the input it gets.</>,
              <>It&apos;s an umbrella: <strong className="text-fg">machine learning</strong> sits inside AI, <strong className="text-fg">deep learning</strong> inside that, and today&apos;s <strong className="text-fg">generative AI</strong> inside that.</>,
              <>Everything that exists today is <strong className="text-fg">narrow or general-purpose AI</strong>. “AGI” has no agreed definition.</>,
              <>A thermostat following one rule isn&apos;t AI. A spam filter that learned from examples is.</>,
            ]}
          />

          <Section id="definition" kicker="Definition" title="A working definition">
            <p>
              John McCarthy, who coined the term in 1955, later described AI as “the science and engineering of making intelligent
              machines”.{c("mccarthy", "dartmouth")} That&apos;s a good description of the <em>field</em>, but it leaves open what counts as
              “intelligent” — and researchers still don&apos;t fully agree.
            </p>
            <p>
              For a practical answer, the most widely used definition today comes from the OECD, updated in November 2023 and closely
              mirrored in the EU&apos;s AI Act:{c("oecd", "eu-ai-act")}
            </p>
            <blockquote className="border-l-2 border-sage pl-5 py-1 font-casual italic text-fg text-lg md:text-xl leading-relaxed">
              “An AI system is a machine-based system that, for explicit or implicit objectives, infers, from the input it receives, how to
              generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual
              environments.”
            </blockquote>
            <p>
              In plain English: <strong>it takes something in, works out a response on its own, and that response affects something</strong>.
              The key word is <em>infers</em>. A calculator or a simple thermostat just executes steps a person spelled out. An AI system
              figures out its answer — usually from patterns it learned.
            </p>
          </Section>

          <Section id="how-it-works" kicker="In practice" title="What an AI system does">
            <p>Every AI system you use follows the same three-step shape, whether it&apos;s unlocking your phone or writing an essay.</p>
            <Figure wide caption="The OECD and EU AI Act definition, drawn as a pipeline. The four output types come straight from the definition.">
              <InputInferOutput />
            </Figure>
          </Section>

          <Section id="circles" kicker="The buzzwords" title="AI, machine learning, deep learning, generative AI">
            <p>
              These terms get used as if they mean the same thing. They don&apos;t — each one sits <strong>inside</strong> the one before,
              like nesting dolls. Tap each circle to see what it adds.
            </p>
          </Section>
          <Figure wide caption="Each circle is a subset of the one around it. Most of the AI in the news today lives in the innermost two.">
            <AICircles rings={rings} />
          </Figure>
          <div className="mb-16 md:mb-20 font-casual text-[17px] md:text-lg text-fg/80 leading-relaxed">
            <Callout label="Why the distinction matters">
              When someone says “we use AI”, ask which circle. A rules engine, a fraud model and a chatbot are all “AI” — but they fail in
              very different ways and need very different checks.
            </Callout>
          </div>

          <Section id="quiz" kicker="Try it" title="Quiz: is it AI?">
            <p>Six everyday things. Decide for each, then see the reasoning.</p>
          </Section>
          <Figure wide caption="Rule of thumb: if a person wrote down every step, it's automation. If the system works out the answer, it's AI.">
            <IsItAI items={quiz} />
          </Figure>
          <div className="mb-16 md:mb-20" />

          <Section id="approaches" kicker="Going deeper" title="Four ways to define intelligence">
            <p>
              The standard AI textbook, by Stuart Russell and Peter Norvig, sorts definitions along two questions: is AI about{" "}
              <strong>thinking</strong> or <strong>acting</strong>? And should it match <strong>humans</strong>, or an ideal of{" "}
              <strong>rationality</strong>?{c("aima")}
            </p>
            <Figure caption="Russell & Norvig's four approaches. Most modern AI is built around the bottom-right one: an agent that acts to achieve its goals as well as it can.">
              <FourApproaches />
            </Figure>
            <p>
              Turing&apos;s famous test sits in the “acting like a human” box. Most engineering today aims for the “acting rationally” box —
              doing the best thing for the goal, whether or not it looks human.
            </p>
          </Section>

          <Section id="narrow-general" kicker="Today vs. tomorrow" title="Narrow AI, general-purpose AI and AGI">
            <p>
              For most of AI&apos;s history, every system was <strong>narrow</strong>: brilliant at one task, useless at the next. Chatbots
              changed that — one model can now draft a contract, debug code and explain a recipe. But being broadly useful isn&apos;t the
              same as matching people at everything.
            </p>
            <Figure wide caption="Where today's systems sit. AGI is shown dashed because there is no agreed definition or test for it.">
              <Spectrum />
            </Figure>
            <p>
              <strong>Artificial general intelligence (AGI)</strong> is the idea of AI that matches people across most thinking tasks.
              Researchers don&apos;t agree on what exactly counts; one proposal from Google DeepMind suggests grading it in levels, the way
              self-driving cars are graded, rather than treating it as a single finish line.{c("levels-agi")} Be sceptical of anyone
              announcing it has been “achieved” without saying which definition they mean.
            </p>
          </Section>

          <Section id="myths" kicker="Fact check" title="Myths vs. facts">
            <div className="grid gap-3">
              {[
                {
                  myth: "AI means robots.",
                  fact: "Most AI is invisible software — ranking your feed, filtering your inbox, flagging card fraud. Robots are just one place AI can run.",
                  src: [] as string[],
                },
                {
                  myth: "AI and machine learning are the same thing.",
                  fact: "Machine learning is one part of AI. Rule-based and search-based systems, like the chess computer Deep Blue, are AI without learning.",
                  src: ["aima", "deep-blue"],
                },
                {
                  myth: "Today's AI is conscious.",
                  fact: "A 2023 review by consciousness scientists and AI researchers concluded that no current AI systems are conscious — while noting there's no obvious technical barrier to building ones that meet more of the indicators.",
                  src: ["consciousness"],
                },
                {
                  myth: "Anything “smart” uses AI.",
                  fact: "Lots of “smart” devices just follow fixed rules. Under the EU's definition, systems that only run rules written by people aren't AI.",
                  src: ["eu-ai-act"],
                },
              ].map((m) => (
                <div key={m.myth} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                  <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-[#e3a08a] mb-1">Myth</p>
                  <p className="font-tech text-lg font-semibold text-fg mb-3 line-through decoration-[#e3a08a]/60">{m.myth}</p>
                  <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-1">Fact</p>
                  <p className="font-casual text-fg/80 leading-relaxed text-base">
                    {m.fact}
                    {m.src.length > 0 && c(...m.src)}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Takeaways
            items={[
              "AI = systems that infer their own outputs (predictions, content, recommendations, decisions) from input.",
              "AI ⊃ machine learning ⊃ deep learning ⊃ today's generative AI.",
              "If every step was written by a person, it's automation — not AI.",
              "Everything today is narrow or general-purpose AI. AGI has no agreed definition yet.",
            ]}
          />

          <p className="mb-16 font-casual text-lg text-fg/75 leading-relaxed">
            Want to know how we got here? Read the{" "}
            <Link href={topicHref("history-of-ai")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
              history of AI
            </Link>
            , from the first artificial neuron in 1943 to today.
          </p>

          <Sources sources={SOURCES} />
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <KeepGoing slug="what-is-ai" />
    </div>
  );
}
