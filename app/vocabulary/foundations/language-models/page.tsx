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
import NextWord from "@/components/foundations/language-models/NextWord";
import Attention from "@/components/foundations/language-models/Attention";
import { BuildPipeline, ContextWindow, HeroArt, StrengthsLimits, TokenStrip } from "@/components/foundations/language-models/Figures";
import { topicHref } from "@/lib/foundations";
import { SOURCES } from "./data";

const PATH = topicHref("language-models");
const TITLE = "How Language Models Work: ChatGPT, Claude and Gemini Explained";
const DESCRIPTION =
  "How large language models (LLMs) like ChatGPT, Claude and Gemini work, in plain language: next-word prediction, tokens, transformers and attention, how chatbots are trained, context windows, hallucinations and limits — with interactive demos and sources.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "next-word", label: "A next-word machine" },
  { id: "tokens", label: "Tokens" },
  { id: "attention", label: "Transformers & attention" },
  { id: "training", label: "From predictor to assistant" },
  { id: "scale", label: "Why size matters" },
  { id: "context", label: "Context windows" },
  { id: "limits", label: "Strengths and limits" },
  { id: "myths", label: "Myths vs. facts" },
  { id: "sources", label: "Sources" },
];

export default function LanguageModels() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const myths: { myth: string; fact: React.ReactNode; src: string[] }[] = [
    {
      myth: "It searches the internet to answer you.",
      fact: "On its own, a language model answers from patterns learned in training. Many chat apps can also connect it to web search or your documents — then it reads those sources first.",
      src: ["rag"],
    },
    {
      myth: "It's “just autocomplete”, so it can't be useful.",
      fact: "It was pre-trained on next-word prediction, but then tuned to follow instructions and reason — and predicting text well turns out to require learning a lot about the world.",
      src: ["gpt3", "instructgpt"],
    },
    {
      myth: "It definitely understands — or definitely doesn't.",
      fact: "Researchers genuinely disagree on whether these models “understand” in any human sense. What's clear is that they can be very capable and still make mistakes no person would.",
      src: ["understanding"],
    },
    {
      myth: "When it's wrong, it's lying.",
      fact: "It isn't trying to deceive. Training and testing have tended to reward a confident guess over “I don't know”, which encourages plausible-sounding errors.",
      src: ["hallucinate"],
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

      <Breadcrumb title="Language models" />
      <ArticleHero
        eyebrow="Foundations · Kinds of models"
        title={TITLE}
        intro="Under the hood, every chatbot does one thing: guess the next word. Here's how that simple trick, done at enormous scale, turns into writing, coding and conversation."
        readingMinutes={12}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>A <strong className="text-fg">large language model (LLM)</strong> predicts the next piece of text, over and over, one piece at a time.</>,
              <>It reads text as <strong className="text-fg">tokens</strong> and uses <strong className="text-fg">attention</strong> to weigh every word against every other.</>,
              <>Chatbots are built in stages: <strong className="text-fg">pre-training</strong> on huge text, then <strong className="text-fg">tuning</strong> with examples and feedback.</>,
              <>They&apos;re strong writers and explainers, but can <strong className="text-fg">state false things confidently</strong> — always check what matters.</>,
            ]}
          />

          <Section id="next-word" kicker="The core trick" title="A next-word machine">
            <p>
              Give a language model some text and it does one thing: it calculates how likely every possible next word is, picks one, adds
              it to the text, and repeats. A whole essay is written this way — one word at a time.{c("gpt3")}
            </p>
            <p>
              It doesn&apos;t always pick the most likely word. A setting called <strong>temperature</strong> controls how adventurous it is:
              low for precise, predictable answers; higher for more varied, creative ones. Try it:
            </p>
          </Section>
          <Figure wide caption="Illustrative probabilities written for this demo — not output from a real model. The sampling and temperature maths are the real thing.">
            <NextWord />
          </Figure>
          <div className="mb-16 md:mb-20 font-casual text-[17px] md:text-lg text-fg/80 leading-relaxed">
            <Callout label="Why this matters">
              To predict the next word well across billions of sentences, a model has to pick up grammar, facts, styles of reasoning and a
              lot about how the world works. That&apos;s why “just predicting the next word” ends up so capable.
            </Callout>
          </div>

          <Section id="tokens" kicker="What the model reads" title="Tokens: how models see text">
            <p>
              Models don&apos;t actually read words or letters. They read <strong>tokens</strong> — chunks of text that are often a whole
              common word, sometimes a piece of one. In English, a rough rule of thumb is that one token is about four characters, or about
              ¾ of a word.{c("tokens")}
            </p>
            <Figure caption="Each coloured chunk is one token. This is why models can stumble on spelling puzzles like counting letters: they never see individual letters.">
              <TokenStrip />
            </Figure>
            <p>Tokens matter in practice: AI services usually charge by the token, and limit how many tokens a model can handle at once.</p>
          </Section>

          <Section id="attention" kicker="The engine" title="Transformers and attention">
            <p>
              Almost every modern language model is a <strong>transformer</strong>, the design Google researchers published in 2017.{c("transformer")}{" "}
              Its key idea is <strong>attention</strong>: when processing each word, the model looks back at every other word and decides
              which ones matter for understanding it.
            </p>
            <p>
              Take the word “it”. To know what “it” means, you need the rest of the sentence. Click the words below, and switch the ending:
            </p>
          </Section>
          <Figure wide caption="Illustrative attention weights, made for this demo. Google's original transformer explainer showed a real model resolving “it” the same way.">
            <Attention />
          </Figure>
          <p className="mb-16 md:mb-20 font-casual text-[17px] md:text-lg text-fg/80 leading-relaxed">
            Real models run many of these attention patterns in parallel, across dozens of layers, each tracking different relationships —
            grammar, meaning, references, tone.{c("transformer-blog", "transformer")}
          </p>

          <Section id="training" kicker="How chatbots are made" title="From predictor to assistant">
            <p>
              A model that only predicts text isn&apos;t a helpful assistant — ask it a question and it might just continue with more
              questions. Chatbots go through extra training stages to turn the raw predictor into something that answers well.{c("instructgpt")}
            </p>
            <Figure wide caption="The broad recipe behind today's chatbots. Exact methods differ between companies and change quickly.">
              <BuildPipeline />
            </Figure>
            <p>
              The newest step trains <strong>reasoning models</strong> with reinforcement learning to work through problems step by step
              before answering, which helps most on maths, science and coding.{c("deepseek-r1")}
            </p>
          </Section>

          <Section id="scale" kicker="The “large” in LLM" title="Why size matters — and data too">
            <p>
              In 2020, researchers found that language models improve predictably as you increase three things: the number of weights, the
              amount of training text and the computing power used.{c("kaplan")} That discovery kicked off the race to build ever bigger
              models — GPT-3 had 175 billion weights.{c("gpt3")}
            </p>
            <p>
              Two years later, DeepMind showed many models were too big for the amount of text they were trained on. Their 70-billion-weight
              Chinchilla, trained on more text, beat much larger models. The lesson: model size and training data should grow together.{c("chinchilla")}
            </p>
          </Section>

          <Section id="context" kicker="Working memory" title="Context windows: what the model can see">
            <p>
              A model can only take a limited amount of text into account at once — its <strong>context window</strong>, measured in tokens.
              It includes your messages, the model&apos;s replies and any documents you paste in. That limit has grown enormously.{c("gpt3", "gemini-15")}
            </p>
            <Figure wide caption="Context window sizes as published by OpenAI (GPT-3 paper) and Google (Gemini 1.5 announcement).">
              <ContextWindow />
            </Figure>
            <p>
              When a conversation gets longer than the window, the oldest parts fall out of view. A model doesn&apos;t remember previous
              chats unless the app saves notes and feeds them back in.
            </p>
          </Section>

          <Section id="limits" kicker="Use them well" title="Strengths and limits">
            <Figure wide caption="A practical summary. Capabilities improve quickly, but the “watch out” column still applies to every model today.">
              <StrengthsLimits />
            </Figure>
            <p>
              The biggest risk is <strong>hallucination</strong>: fluent, confident answers that are wrong. A 2025 OpenAI paper argues part of
              the cause is how models are scored — tests usually reward a lucky guess more than an honest “I don&apos;t know”.{c("hallucinate")}{" "}
              Connecting a model to search or your own documents, called <strong>retrieval-augmented generation</strong>, helps by grounding
              its answers in real sources.{c("rag")}
            </p>
          </Section>

          <Section id="myths" kicker="Fact check" title="Myths vs. facts">
            <div className="grid gap-3">
              {myths.map((m) => (
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
              "An LLM writes by predicting the next token, again and again.",
              "Transformers use attention to connect every word with every other.",
              "Chatbots = pre-trained predictor + instruction tuning + feedback.",
              "Fluent isn't the same as correct: check facts that matter.",
            ]}
          />

          <p className="mb-16 font-casual text-lg text-fg/75 leading-relaxed">
            The training ideas here — weights, loss, gradient descent — are explained in{" "}
            <Link href={topicHref("how-machines-learn")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
              How machines learn
            </Link>
            .
          </p>

          <Sources sources={SOURCES} />
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <KeepGoing slug="language-models" />
    </div>
  );
}
