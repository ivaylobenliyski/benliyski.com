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
import AgentLoop from "@/components/foundations/ai-agents/AgentLoop";
import Reliability from "@/components/foundations/ai-agents/Reliability";
import { AutonomySpectrum, DoublingFigure, HeroArt, ToolsFigure } from "@/components/foundations/ai-agents/Figures";
import MythOrFact, { type MythOrFactItem } from "@/components/foundations/MythOrFact";
import { topicHref } from "@/lib/foundations";
import { SOURCES } from "./data";

const PATH = topicHref("ai-agents");
const TITLE = "What Are AI Agents? How AI Plans, Uses Tools and Acts";
const DESCRIPTION =
  "AI agents explained in plain language: how a language model becomes an agent, the think–act–observe loop (watch one work), tools and the Model Context Protocol, what agents can do today, why long tasks are hard, and the risks — with sources.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "what", label: "From answering to doing" },
  { id: "loop", label: "The agent loop" },
  { id: "tools", label: "Tools" },
  { id: "spectrum", label: "Workflows vs. agents" },
  { id: "today", label: "What agents can do" },
  { id: "reliability", label: "Why long tasks are hard" },
  { id: "risks", label: "Risks and safeguards" },
  { id: "myths", label: "Myth or fact?" },
  { id: "sources", label: "Sources" },
];

export default function AIAgents() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const mythOrFact: MythOrFactItem[] = [
    {
      statement: "An AI agent is a completely different kind of AI model.",
      isMyth: true,
      explanation: <>Most agents are an ordinary language model running in a loop, with access to tools and instructions about its goal.{c("react", "building-agents")}</>,
    },
    {
      statement: "The length of software tasks AI agents can complete has been doubling roughly every seven months.",
      isMyth: false,
      explanation: <>Researchers at METR measured this trend over six years, using how long the same tasks take skilled people. They note the estimate depends on which tasks are used.{c("metr")}</>,
    },
    {
      statement: "Agents are reliable enough to run unsupervised on anything.",
      isMyth: true,
      explanation: <>Even their makers call them error-prone in places. Testing in safe environments and human approval for risky actions are standard advice.{c("computer-use", "building-agents")}</>,
    },
    {
      statement: "If every step is 95% reliable, a 20-step task is about 95% reliable too.",
      isMyth: true,
      explanation: <>Success rates multiply: 0.95 to the power of 20 is about 36%. That&apos;s why long tasks are so much harder than short ones.</>,
    },
    {
      statement: "AI coding agents are tested on real bug reports from open-source projects.",
      isMyth: false,
      explanation: <>The SWE-bench benchmark uses 2,294 real GitHub issues from 12 popular Python projects. When it launched in 2023, the best model solved under 2% of them.{c("swe-bench")}</>,
    },
    {
      statement: "Only the person using an agent can give it instructions.",
      isMyth: true,
      explanation: <>Text hidden in web pages, emails or documents the agent reads can smuggle in instructions — an attack called indirect prompt injection.{c("injection")}</>,
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

      <Breadcrumb title="AI agents" />
      <ArticleHero
        eyebrow="Foundations · AI in the world"
        title={TITLE}
        intro="A chatbot answers. An agent gets things done: it plans, uses tools, checks the results and keeps going until the job is finished — or it gets stuck."
        readingMinutes={10}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>An <strong className="text-fg">AI agent</strong> is usually a language model in a loop: <strong className="text-fg">think, act, observe</strong>, repeat.</>,
              <>It acts through <strong className="text-fg">tools</strong> — search, files, code, email, even a computer screen.</>,
              <>Agents are improving fast, but <strong className="text-fg">errors add up</strong> over long tasks.</>,
              <>Good agents <strong className="text-fg">ask before risky actions</strong> and treat what they read with suspicion.</>,
            ]}
          />

          <Section id="what" kicker="The idea" title="From answering to doing">
            <p>
              In AI textbooks, an <strong>agent</strong> is anything that perceives its environment and acts on it.{c("aima")} Today the word
              usually means something more specific: a{" "}
              <Link href={topicHref("language-models")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
                language model
              </Link>{" "}
              that doesn&apos;t just reply to you, but decides what to do next, takes actions with tools and keeps going until a goal is met.
            </p>
            <p>
              Anthropic draws a useful line: in a <strong>workflow</strong>, models and tools follow steps a developer wrote in advance; in an{" "}
              <strong>agent</strong>, the model directs its own process and decides which tools to use.{c("building-agents")}
            </p>
          </Section>

          <Section id="loop" kicker="Watch one work" title="The agent loop: think, act, observe">
            <p>
              In 2022, researchers showed that letting a model alternate between <strong>reasoning</strong> about a task and{" "}
              <strong>acting</strong> on it — then reading the result — worked far better than either alone. They called it ReAct.{c("react")}{" "}
              Nearly every agent today follows this loop. Step through one:
            </p>
          </Section>
          <Figure wide caption="A scripted example of the loop, written for this page. Real agents follow the same pattern, often over dozens or hundreds of steps.">
            <AgentLoop />
          </Figure>
          <div className="mb-16 md:mb-20" />

          <Section id="tools" kicker="Hands and eyes" title="Tools: how agents act">
            <p>
              A language model can only produce text. <strong>Tools</strong> give it reach: the model writes a structured request such as{" "}
              <code className="font-mono text-[0.9em] bg-card px-1.5 py-0.5 rounded">search(&quot;train times Sofia–Plovdiv&quot;)</code>, the app runs it, and the
              result is fed back in. Researchers showed in 2023 that models can even learn by themselves when calling a tool helps.{c("toolformer")}
            </p>
            <Figure wide caption="Typical tools. The model never touches these directly — it asks, the surrounding software does the work and reports back.">
              <ToolsFigure />
            </Figure>
            <p>
              Connecting every model to every tool used to mean custom code each time. In November 2024 Anthropic released the{" "}
              <strong>Model Context Protocol (MCP)</strong>, an open standard for plugging tools and data into AI apps — a bit like a universal plug.{c("mcp")}{" "}
              OpenAI adopted it in March 2025.{c("mcp-openai")}
            </p>
          </Section>

          <Section id="spectrum" kicker="How much freedom?" title="Chatbots, workflows and agents">
            <p>
              Autonomy is a dial, not a switch. More freedom makes a system more flexible — and harder to predict. Anthropic&apos;s advice to
              builders is to start with the simplest approach that works and add autonomy only when it&apos;s needed.{c("building-agents")}
            </p>
            <Figure wide caption="Three levels of autonomy, following Anthropic's distinction between workflows and agents.">
              <AutonomySpectrum />
            </Figure>
          </Section>

          <Section id="today" kicker="Where things stand" title="What agents can do today">
            <p>
              <strong>Coding</strong>{" "}is where agents have advanced most visibly. The SWE-bench test gives an agent a real bug report from an
              open-source project and checks whether its fix passes the project&apos;s tests. When it launched in 2023, the best model solved
              under 2% of its 2,294 tasks.{c("swe-bench")}
            </p>
            <p>
              Agents can also <strong>use a computer</strong> the way people do — reading screenshots, moving the mouse and typing. Anthropic
              released this in October 2024, calling it experimental and at times error-prone.{c("computer-use")}
            </p>
            <Callout label="A trend to watch">
              METR, an AI evaluation group, measured how long the software tasks AI agents can complete are — counted in how long they take
              skilled people. Over six years, that length has doubled roughly every seven months. The researchers caution that the exact numbers
              depend on which tasks are measured.{c("metr")}
            </Callout>
            <Figure caption="What doubling every seven months means: sixteen times longer tasks in a little over two years — if the trend holds.">
              <DoublingFigure />
            </Figure>
          </Section>

          <Section id="reliability" kicker="Try it" title="Why long tasks are hard">
            <p>
              An agent&apos;s task is only as reliable as its chain of steps. If every step has to go right, the chances multiply — and a
              small error rate becomes a big one over a long task. Play with the numbers:
            </p>
          </Section>
          <Figure wide caption="Simple probability: overall success = (success per step) ^ (number of steps). Real agents can do better by checking their work and retrying.">
            <Reliability />
          </Figure>
          <div className="mb-16 md:mb-20" />

          <Section id="risks" kicker="Use them safely" title="Risks and safeguards">
            <p>
              Because agents <em>act</em>, their mistakes have consequences: a wrong email sent, a file deleted, money spent. And because they
              follow instructions, anything they read can try to instruct them. Text hidden in a web page or document can hijack an agent —
              an attack called <strong>indirect prompt injection</strong>.{c("injection")}
            </p>
            <ul className="space-y-2 list-none">
              {[
                "Give agents only the access they need — read-only where possible.",
                "Require a human to approve actions that are hard to undo: sending, paying, deleting.",
                "Test in a safe sandbox before letting an agent loose on real systems.",
                "Keep a log of what the agent did, so mistakes can be traced and fixed.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="text-sage mt-0.5" aria-hidden="true">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p>
              These match the practices Anthropic recommends for building agents: extensive testing in sandboxed environments, appropriate
              guardrails, and human checkpoints.{c("building-agents")}
            </p>
          </Section>

          <Section id="myths" kicker="Fact check" title="Myth or fact?">
            <p>Six statements about AI agents. Some are true, some are popular misconceptions. Can you tell which is which?</p>
            <MythOrFact items={mythOrFact} />
          </Section>

          <Takeaways
            items={[
              "An agent is a model in a loop: think, act with a tool, observe, repeat.",
              "Tools — and standards like MCP — give models reach beyond text.",
              "Agents are improving fast, but long tasks multiply small error rates.",
              "Limit access, approve risky actions, and distrust instructions found in content.",
            ]}
          />

          <p className="mb-16 font-casual text-lg text-fg/75 leading-relaxed">
            Agents build on everything else on the map — especially{" "}
            <Link href={topicHref("language-models")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
              language models
            </Link>{" "}
            and{" "}
            <Link href={topicHref("multimodal-models")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
              multimodal models
            </Link>
            .
          </p>
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <KeepGoing slug="ai-agents" />

      <div className="max-w-3xl mt-16">
        <Sources sources={SOURCES} />
      </div>
    </div>
  );
}
