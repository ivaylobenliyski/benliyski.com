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
import TrainingPlayground from "@/components/foundations/how-machines-learn/TrainingPlayground";
import { FitComparison, HeroArt, KindsOfLearning, LayeredNetwork, LearningLoop, TrainVsUse } from "@/components/foundations/how-machines-learn/Figures";
import { topicHref } from "@/lib/foundations";
import { SOURCES } from "./data";

const PATH = topicHref("how-machines-learn");
const TITLE = "How Machines Learn: Training, Data and Neural Networks";
const DESCRIPTION =
  "How machine learning actually works, without the maths: the training loop, weights and gradient descent (try it yourself), the four kinds of learning, neural networks, overfitting and why data decides everything.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "loop", label: "Learning = getting less wrong" },
  { id: "try", label: "Train a model yourself" },
  { id: "kinds", label: "Four ways machines learn" },
  { id: "neural-networks", label: "Neural networks" },
  { id: "overfitting", label: "Learning vs. memorising" },
  { id: "data", label: "Data decides" },
  { id: "training-vs-using", label: "Training vs. using" },
  { id: "myths", label: "Myths vs. facts" },
  { id: "sources", label: "Sources" },
];

export default function HowMachinesLearn() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const myths: { myth: string; fact: React.ReactNode; src: string[] }[] = [
    {
      myth: "Chatbots learn from my conversation as we talk.",
      fact: "While you use a model, its weights are fixed — it isn't learning. It can use what you said earlier in the same chat, and some companies may use conversations to train future versions, depending on your settings.",
      src: [],
    },
    {
      myth: "Neural networks work just like the brain.",
      fact: "They were inspired by neurons, but an artificial neuron is a vastly simplified bit of arithmetic, and scientists still debate whether brains learn anything like the way networks are trained.",
      src: ["deep-learning"],
    },
    {
      myth: "The model keeps a copy of everything it read.",
      fact: "Mostly it stores patterns, not documents. But large models can memorise some passages word for word — researchers extracted hundreds of verbatim training snippets from GPT-2.",
      src: ["carlini"],
    },
    {
      myth: "Training longer always makes a model better.",
      fact: "Past a point, a model starts memorising quirks of its training data and gets worse on new examples. That's why teams always test on data the model has never seen.",
      src: ["goodfellow"],
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

      <Breadcrumb title="How machines learn" />
      <ArticleHero
        eyebrow="Foundations · How it works"
        title={TITLE}
        intro="No maths, no magic: a machine learns by guessing, checking how wrong it was, and nudging itself to be a little less wrong — billions of times."
        readingMinutes={11}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>A model is a function full of adjustable numbers called <strong className="text-fg">weights</strong> (or parameters).</>,
              <><strong className="text-fg">Training</strong> = show an example, measure the error, nudge every weight to shrink it, repeat.</>,
              <>A <strong className="text-fg">neural network</strong> stacks many layers of these weights, so it can learn very complex patterns.</>,
              <>The model can only be as good as its <strong className="text-fg">data</strong> — and it must be tested on examples it has never seen.</>,
            ]}
          />

          <Section id="loop" kicker="The core idea" title="Learning = getting less wrong">
            <p>
              Traditional software follows rules a person wrote. Machine learning flips that: you give the computer{" "}
              <strong>examples</strong> and let it work out the rules itself. Arthur Samuel showed this in the 1950s with a checkers program
              that improved by playing.{c("samuel")}
            </p>
            <p>
              Inside every model is a long list of numbers — its <strong>weights</strong>{" "}— that decide how input turns into output. At the
              start they&apos;re random, so the model&apos;s guesses are rubbish. Training improves them with one simple loop:{c("goodfellow")}
            </p>
            <Figure wide caption="The training loop. Every modern AI model, from a spam filter to a chatbot, is trained with some version of it.">
              <LearningLoop />
            </Figure>
            <p>
              The “adjust” step has a name: <strong>gradient descent</strong>. Picture standing on a foggy hillside where height is the
              error. You can&apos;t see the valley, but you can feel which way is downhill — so you take a small step that way, and repeat.{c("deep-learning")}
            </p>
          </Section>

          <Section id="try" kicker="Try it" title="Train a model yourself">
            <p>
              Here&apos;s the smallest possible model: a straight line that predicts a test score from hours of practice. It has just{" "}
              <strong>two weights</strong> — how steep the line is, and where it starts. Press <em>Train</em>{" "}and watch gradient descent
              shrink the error. Then try a step size that&apos;s too big.
            </p>
          </Section>
          <Figure wide caption="Real gradient descent running in your browser, on 12 made-up examples. Large language models do the same thing with billions of weights and trillions of words.">
            <TrainingPlayground />
          </Figure>
          <div className="mb-16 md:mb-20 font-casual text-[17px] md:text-lg text-fg/80 leading-relaxed">
            <Callout label="What you just saw">
              The <strong className="text-fg">loss</strong> is the average error. The <strong className="text-fg">learning rate</strong> is the
              step size. Too small and training crawls; too big and it overshoots and blows up. Choosing it well is one of the everyday jobs of
              people who train models.
            </Callout>
          </div>

          <Section id="kinds" kicker="Approaches" title="Four ways machines learn">
            <p>
              What changes between approaches is <em>where the “right answer” comes from</em> when the model compares its guess.{c("aima")}
            </p>
            <Figure wide caption="Most real systems combine several. A chatbot is pre-trained self-supervised, then fine-tuned with supervised examples and reinforcement learning.">
              <KindsOfLearning />
            </Figure>
            <p>
              <strong>Self-supervised</strong>{" "}learning is what unlocked today&apos;s language models: predicting the next word in billions of
              sentences needs no human labels, so models could learn from huge amounts of text.{c("gpt3")}{" "}
              <strong>Reinforcement learning</strong> — learning from rewards rather than correct answers — powered AlphaGo,{c("sutton-barto", "alphago")}{" "}
              and is now used to make chatbots more helpful and to train models that reason step by step.{c("instructgpt", "deepseek-r1")}
            </p>
          </Section>

          <Section id="neural-networks" kicker="The workhorse" title="Neural networks: millions of tiny dials">
            <p>
              A straight line can only learn straight-line patterns. To recognise a face or write a sentence you need something far more
              flexible: a <strong>neural network</strong>. It&apos;s built from many simple artificial neurons arranged in layers. Each neuron
              takes numbers in, weighs them, adds them up and passes a result on. Every connection has a weight — a dial training can turn.
            </p>
            <Figure wide caption="A simplified image classifier. Studies that visualise trained networks find early layers responding to edges and later layers to object parts and whole objects.">
              <LayeredNetwork />
            </Figure>
            <p>
              Nobody tells the layers what to look for. Trained on enough labelled photos, early layers end up detecting edges, middle layers
              textures and shapes, and later layers whole parts of objects.{c("deep-learning", "zeiler")} This is what the “deep” in deep
              learning means: many layers, each building on the last.
            </p>
            <p>
              To train all those weights at once, networks use <strong>backpropagation</strong>: the error at the output is passed backwards
              through the layers, working out how much each weight contributed, so each can be nudged the right way.{c("backprop")} Scale this
              up and you get models like GPT-3, with 175 billion weights.{c("gpt3")}
            </p>
          </Section>

          <Section id="overfitting" kicker="The classic trap" title="Learning vs. memorising">
            <p>
              A model that scores perfectly on its training examples might just have memorised them — like a student who learns the answer
              sheet instead of the subject. This is called <strong>overfitting</strong>.{c("goodfellow")}
            </p>
            <Figure wide caption="Same eight examples, three models. Only the middle one will make good predictions on new data.">
              <FitComparison />
            </Figure>
            <p>
              The fix is simple in principle: hold back some examples the model never trains on, and judge it only on those. If it does well
              on data it has never seen, it has learned something general.
            </p>
          </Section>

          <Section id="data" kicker="Garbage in, garbage out" title="Data decides">
            <p>
              A model learns whatever patterns are in its data — including the gaps and biases. In 2018, Joy Buolamwini and Timnit Gebru
              tested three commercial face-analysis systems. Their error rates for classifying gender reached up to 34.7% for darker-skinned
              women, compared with at most 0.8% for lighter-skinned men.{c("gender-shades")}
            </p>
            <Callout label="The lesson">
              Nobody programmed that bias in. The systems learned from data that didn&apos;t represent everyone equally — and the problem
              only came to light because someone tested them on a balanced set.
            </Callout>
          </Section>

          <Section id="training-vs-using" kicker="Two phases" title="Training vs. using a model">
            <p>
              Training and using a model are separate steps. Training is the expensive part, done before release. Using it — called{" "}
              <strong>inference</strong> — just runs your input through the finished weights.
            </p>
            <Figure wide caption="When you chat with an AI model, you're using a finished model. Its weights only change when the company trains a new version.">
              <TrainVsUse />
            </Figure>
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
              "A model is a function with adjustable weights; training tunes them.",
              "Training loop: guess, measure the error, nudge the weights, repeat.",
              "Neural networks stack layers so they can learn complex patterns from raw data.",
              "Always judge a model on data it has never seen — and check what its data leaves out.",
            ]}
          />

          <p className="mb-16 font-casual text-lg text-fg/75 leading-relaxed">
            New here? Start with{" "}
            <Link href={topicHref("what-is-ai")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
              What is AI?
            </Link>{" "}
            — or see where these ideas came from in the{" "}
            <Link href={topicHref("history-of-ai")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
              history of AI
            </Link>
            .
          </p>

          <Sources sources={SOURCES} />
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <KeepGoing slug="how-machines-learn" />
    </div>
  );
}
