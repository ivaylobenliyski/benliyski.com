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
import Timeline from "@/components/foundations/history/Timeline";
import PerceptronPlayground from "@/components/foundations/history/PerceptronPlayground";
import { HeroArt, ImitationGame, NeuronDiagram, RulesVsLearning, SeasonsChart, ThreeIngredients } from "@/components/foundations/history/Figures";
import MythOrFact, { type MythOrFactItem } from "@/components/foundations/MythOrFact";
import { topicHref } from "@/lib/foundations";
import { ERAS, EVENTS, SOURCES } from "./data";

const PATH = topicHref("history-of-ai");
const TITLE = "The History of AI, from 1943 to Today";
const DESCRIPTION =
  "A visual, sourced history of artificial intelligence: the first artificial neuron, Turing's test, the AI winters, the deep learning breakthrough, ChatGPT and reasoning models — in plain language.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "shape", label: "The shape of the story" },
  { id: "origins", label: "Can machines think?" },
  { id: "perceptron", label: "Try the perceptron" },
  { id: "winters", label: "Booms and winters" },
  { id: "comeback", label: "The deep learning comeback" },
  { id: "generative", label: "The generative era" },
  { id: "timeline", label: "Full timeline" },
  { id: "myths", label: "Myth or fact?" },
  { id: "sources", label: "Sources" },
];

const MYTHS = [
  {
    myth: "AI is a new invention.",
    fact: "The term dates from a 1955 proposal, and the first artificial neuron from 1943. What's new is that it finally works well enough to use every day.",
    sources: ["dartmouth", "mcculloch-pitts"],
  },
  {
    myth: "Backpropagation was invented in 1986.",
    fact: "The core maths was described earlier, notably by Seppo Linnainmaa (1970) and Paul Werbos (1974). The 1986 Nature paper is what made it famous for neural networks.",
    sources: ["schmidhuber", "backprop"],
  },
  {
    myth: "Minsky and Papert proved neural networks can't work.",
    fact: "They proved limits of single-layer perceptrons. Networks with hidden layers can learn patterns like XOR — once there was a practical way to train them.",
    sources: ["perceptrons-book", "backprop"],
  },
  {
    myth: "Deep Blue was an early version of today's AI.",
    fact: "Deep Blue mostly searched through millions of chess positions using hand-tuned rules. Today's systems learn their skills from data, which is a different approach.",
    sources: ["deep-blue"],
  },
];

export default function HistoryOfAI() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const mythOrFact: MythOrFactItem[] = [
    { statement: MYTHS[0].myth, isMyth: true, explanation: <>{MYTHS[0].fact}{MYTHS[0].sources.length > 0 && c(...MYTHS[0].sources)}</> },
    { statement: "A chatbot from 1966 convinced some people it was human.", isMyth: false, explanation: <>ELIZA only matched keywords, yet its creator Joseph Weizenbaum wrote that some people were hard to convince it wasn&apos;t human.{c("eliza")}</> },
    { statement: MYTHS[1].myth, isMyth: true, explanation: <>{MYTHS[1].fact}{MYTHS[1].sources.length > 0 && c(...MYTHS[1].sources)}</> },
    { statement: MYTHS[2].myth, isMyth: true, explanation: <>{MYTHS[2].fact}{MYTHS[2].sources.length > 0 && c(...MYTHS[2].sources)}</> },
    { statement: "AI researchers won Nobel prizes in both physics and chemistry in 2024.", isMyth: false, explanation: <>Physics went to John Hopfield and Geoffrey Hinton for work on neural networks; half of Chemistry went to Demis Hassabis and John Jumper for AlphaFold.{c("nobel-physics", "nobel-chemistry")}</> },
    { statement: MYTHS[3].myth, isMyth: true, explanation: <>{MYTHS[3].fact}{MYTHS[3].sources.length > 0 && c(...MYTHS[3].sources)}</> },
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

      <Breadcrumb title="History of AI" />
      <ArticleHero
        eyebrow="Foundations · The big picture"
        title={TITLE}
        intro="Eighty years of bold promises, frozen budgets and sudden breakthroughs — and why today's AI boom is the third act of a much older story."
        readingMinutes={12}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>AI is older than most people think: the field was named in <strong className="text-fg">1955</strong> and its core idea — artificial neurons — dates to 1943.</>,
              <>It moved in <strong className="text-fg">booms and “winters”</strong>: big promises, disappointment, funding cuts, then a comeback.</>,
              <>The big shift was from <strong className="text-fg">writing rules</strong> by hand to <strong className="text-fg">learning from examples</strong>.</>,
              <>Today&apos;s boom came from three things arriving together: lots of data, fast chips, and better neural networks.</>,
            ]}
          />

          <Section id="shape" kicker="Overview" title="The shape of the story">
            <p>
              The history of AI isn&apos;t a straight line. It looks more like the seasons: periods of excitement and generous
              funding (“AI summers”) followed by disappointment and cuts (“AI winters”). Each time, researchers promised too much too
              soon — and each time, some of the ideas quietly survived and came back stronger.
            </p>
            <Figure caption="An illustration of the pattern historians describe — not measured data. Winter dates are approximate and differ between sources.">
              <SeasonsChart />
            </Figure>
          </Section>

          <Section id="origins" kicker="1943–1956" title="Can machines think?">
            <p>
              The story starts before computers could do much at all. In 1943, Warren McCulloch and Walter Pitts described brain cells
              as tiny switches: each one adds up the signals coming in and “fires” if the total is high enough.{c("mcculloch-pitts")}{" "}
              Wire enough of these together and, in principle, you can compute anything. That idea — the <strong>artificial neuron</strong>{" "}
              — is still the basic building block of today&apos;s AI.
            </p>
            <Figure caption="An artificial neuron: weigh each input, add them up, fire if the total crosses a threshold. Modern networks chain together billions of these.">
              <NeuronDiagram />
            </Figure>
            <p>
              In 1950, Alan Turing asked the question directly: <em>can machines think?</em>{" "}Rather than argue about definitions, he
              proposed a game. A judge chats by text with two hidden players — one human, one machine. If the judge can&apos;t reliably tell
              which is which, Turing argued, we should take the machine&apos;s intelligence seriously.{c("turing")}
            </p>
            <Figure caption="Turing's “imitation game”, now known as the Turing test. The two example questions are taken from his 1950 paper.">
              <ImitationGame />
            </Figure>
            <p>
              Five years later, four researchers — John McCarthy, Marvin Minsky, Nathaniel Rochester and Claude Shannon — asked for
              funding for a summer workshop at Dartmouth College. Their proposal coined the term <strong>“artificial intelligence”</strong>{" "}
              and set out a bold bet: that every aspect of learning or intelligence could, in principle, be described so precisely that a
              machine could simulate it.{c("dartmouth")} The workshop ran in summer 1956, and the field had a name.
            </p>
          </Section>

          <Section id="perceptron" kicker="1958–1969" title="Try it: the perceptron">
            <p>
              In 1958, psychologist Frank Rosenblatt built the <strong>perceptron</strong>: an artificial neuron that could{" "}
              <em>learn</em> its own weights from examples, instead of having them set by hand.{c("rosenblatt")} It caused huge
              excitement. Then, in 1969, Marvin Minsky and Seymour Papert published a book showing what a single perceptron{" "}
              <em>can&apos;t</em> learn.{c("perceptrons-book")}
            </p>
            <p>See for yourself. Adjust the weights and the threshold until the perceptron matches the goal. AND and OR are easy. Then try XOR.</p>
          </Section>
          <Figure wide caption="A one-neuron perceptron, like Rosenblatt's. It can only split the inputs with a single straight line, which is why XOR is out of reach.">
            <PerceptronPlayground />
          </Figure>
          <div className="mb-16 md:mb-20 font-casual text-[17px] md:text-lg text-fg/80 leading-relaxed">
            <Callout label="Why it matters">
              Stack neurons in layers, with “hidden” neurons between input and output, and XOR becomes easy. The problem in 1969 was that
              nobody had a practical way to train those hidden layers. That took another 17 years.
            </Callout>
          </div>

          <Section id="winters" kicker="1960s–1980s" title="Booms and winters">
            <p>
              Early programs looked impressive. In 1966, Joseph Weizenbaum&apos;s <strong>ELIZA</strong>{" "}held text conversations by
              spotting keywords and turning your statements back into questions. Weizenbaum wrote that some people were hard to
              convince it wasn&apos;t human — though it understood nothing.{c("eliza")}
            </p>
            <p>
              But the big promises — machine translation, general problem solving, robots that understood the world — weren&apos;t
              delivered. In 1973, a report by mathematician Sir James Lighthill for the UK Science Research Council concluded that AI
              had failed to achieve its grand ambitions.{c("lighthill")} British funding for AI research was sharply cut, and US funding
              agencies also became more cautious in the mid-1970s. This became known as the <strong>first AI winter</strong>.{c("agar", "aima")}
            </p>
            <p>
              The 1980s brought a second boom built on <strong>expert systems</strong>: programs packed with thousands of if-then rules
              written by human experts. One famous example, XCON (also called R1), configured computer orders at Digital Equipment Corporation.{c("xcon")}{" "}
              Businesses invested heavily — until the systems proved brittle, expensive to maintain and unable to handle situations their
              rules didn&apos;t cover. By the late 1980s the market collapsed: the <strong>second AI winter</strong>.{c("aima")}
            </p>
            <Figure caption="The core shift in AI's history: from people writing the rules to machines learning them from examples.">
              <RulesVsLearning />
            </Figure>
          </Section>

          <Section id="comeback" kicker="1986–2012" title="The deep learning comeback">
            <p>
              While rule-based AI struggled, neural networks were quietly fixed. In 1986, David Rumelhart, Geoffrey Hinton and Ronald
              Williams showed how <strong>backpropagation</strong> could train networks with hidden layers: run an example through,
              measure the error, then pass it backwards to nudge every weight a little.{c("backprop")} The underlying maths had been
              worked out earlier — this paper made it famous.{c("schmidhuber")}
            </p>
            <p>
              Progress was real but slow. In 1997, IBM&apos;s Deep Blue beat world chess champion Garry Kasparov — though mostly by
              searching through enormous numbers of positions, not by learning.{c("deep-blue")} In 1998, Yann LeCun&apos;s team showed that
              convolutional neural networks could read handwritten digits, including on bank cheques.{c("lenet")} And in 2009, Fei-Fei
              Li&apos;s team released <strong>ImageNet</strong>, a huge collection of labelled images that became the field&apos;s favourite
              benchmark.{c("imagenet")}
            </p>
            <p>
              Then, in 2012, everything clicked. A deep neural network called <strong>AlexNet</strong> won the ImageNet challenge with a
              top-5 error rate of 15.3% — the next-best entry had 26.2%.{c("alexnet")} Within a few years, almost the whole industry
              had switched to deep learning.
            </p>
            <Figure caption="Why 2012? Three ingredients finally arrived at the same time. Figures from the AlexNet paper.">
              <ThreeIngredients />
            </Figure>
            <p>
              In 2016, DeepMind&apos;s <strong>AlphaGo</strong> beat Go champion Lee Sedol 4–1. Unlike Deep Blue, it learned much of its
              skill from human games and by playing against itself.{c("alphago")}
            </p>
          </Section>

          <Section id="generative" kicker="2017–today" title="The generative era">
            <p>
              In 2017, a team at Google published <strong>“Attention Is All You Need”</strong>, introducing the{" "}
              <strong>transformer</strong>.{c("transformer")} Its key trick, “attention”, lets the model weigh every word in a passage
              against every other word at once. Transformers are the “T” in GPT, and almost every modern language model is built on them.
            </p>
            <p>
              Researchers then found that making these models bigger and training them on more text kept making them more capable. In 2020,
              GPT-3 could take on new tasks from just a few examples typed into the prompt.{c("gpt3")} The same year, DeepMind&apos;s
              AlphaFold 2 predicted protein structures with accuracy competitive with lab experiments in most cases.{c("alphafold")}
            </p>
            <p>
              On 30 November 2022, OpenAI released <strong>ChatGPT</strong> as a free research preview.{c("chatgpt")} AI went from a
              research topic to something anyone could talk to.
            </p>
            <Callout label="Recognition and rules">
              In 2024, AI pioneers won two Nobel prizes: Physics for John Hopfield and Geoffrey Hinton&apos;s work on neural networks, and half
              of Chemistry for Demis Hassabis and John Jumper&apos;s AlphaFold.{c("nobel-physics", "nobel-chemistry")} The same year, the
              EU&apos;s AI Act came into force on 1 August, the first broad law regulating AI, with its rules phasing in over several years.{c("eu-ai-act")}
            </Callout>
            <p>
              The newest shift is <strong>reasoning models</strong>. OpenAI&apos;s o1 (September 2024) and DeepSeek-R1 (January 2025,
              later peer-reviewed in <em>Nature</em>) were trained with reinforcement learning to work through a problem step by step before
              answering.{c("o1", "deepseek-r1")} Instead of only building bigger models, you can also give a model more time to think when you ask it something.
            </p>
            <p>
              What these models actually are, and how they learn, is the next stop on the map:{" "}
              <Link href={topicHref("how-machines-learn")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
                How machines learn
              </Link>
              .
            </p>
          </Section>

          <Section id="timeline" kicker="Explore" title="The full timeline">
            <p>Filter by era. Every event links to its source.</p>
          </Section>
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <div className="-mt-10 mb-16 md:mb-20">
        <Timeline events={EVENTS} eras={ERAS} sources={SOURCES} />
      </div>

      <div className="max-w-3xl">
        <Section id="myths" kicker="Fact check" title="Myth or fact?">
          <p>Six statements about the history of AI. Some are true, some are popular misconceptions. Can you tell which is which?</p>
          <MythOrFact items={mythOrFact} />
        </Section>

        <Takeaways
          items={[
            "AI is an 80-year-old field. Today's tools build on ideas from the 1940s and 1950s.",
            "Hype has crashed twice before. Results, not promises, are what kept the field alive.",
            "The winning approach was learning from data rather than hand-writing rules.",
            "Breakthroughs came when data, computing power and algorithms improved together.",
          ]}
        />

        <Sources sources={SOURCES} />
      </div>

      <KeepGoing slug="history-of-ai" />
    </div>
  );
}
