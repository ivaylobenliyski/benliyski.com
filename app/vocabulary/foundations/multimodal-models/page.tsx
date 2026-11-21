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
import PipelineCompare from "@/components/foundations/multimodal-models/PipelineCompare";
import MeaningSpace from "@/components/foundations/multimodal-models/MeaningSpace";
import { Capabilities, EverythingTokens, HeroArt } from "@/components/foundations/multimodal-models/Figures";
import MythOrFact, { type MythOrFactItem } from "@/components/foundations/MythOrFact";
import { topicHref } from "@/lib/foundations";
import { SOURCES } from "./data";

const PATH = topicHref("multimodal-models");
const TITLE = "Multimodal AI: Models That Read, See and Hear";
const DESCRIPTION =
  "What multimodal AI models are and how they work, in plain language: one model for text, images and audio, shared meaning spaces, why native multimodality beats chaining models, what they can do, and their limits — with interactive demos and sources.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "what", label: "One model, many senses" },
  { id: "meaning", label: "A shared space for meaning" },
  { id: "tokens", label: "Everything becomes tokens" },
  { id: "native", label: "Chained vs. native" },
  { id: "can-do", label: "What they can do" },
  { id: "limits", label: "Limits and risks" },
  { id: "myths", label: "Myth or fact?" },
  { id: "sources", label: "Sources" },
];

export default function MultimodalModels() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const myths: { myth: string; fact: React.ReactNode; src: string[] }[] = [
    {
      myth: "It sees every detail of the picture, like a camera.",
      fact: "The image is compressed into a limited number of tokens. Small text, exact counts and precise positions can get lost — and the model may confidently describe things that aren't there.",
      src: ["pope"],
    },
    {
      myth: "Multimodal AI is just several AIs bolted together.",
      fact: "Early systems were. Many recent models, such as Gemini and GPT-4o, are trained across text, images and audio as a single model.",
      src: ["gemini", "gpt4o"],
    },
    {
      myth: "Images and audio are safe — only text can carry instructions.",
      fact: "Researchers have hidden instructions inside images and sound clips that a multimodal model then follows, while a person sees or hears nothing unusual.",
      src: ["injection"],
    },
    {
      myth: "A model that can describe a scene understands it like we do.",
      fact: "Describing is not the same as understanding. The same models that describe a scene fluently can also mention objects that simply aren't in it.",
      src: ["pope"],
    },
  ];

  const mythOrFact: MythOrFactItem[] = [
    { statement: myths[0].myth, isMyth: true, explanation: <>{myths[0].fact}{myths[0].src.length > 0 && c(...myths[0].src)}</> },
    { statement: "Earlier voice assistants turned your speech into plain text before the AI model saw it.", isMyth: false, explanation: <>ChatGPT&apos;s earlier Voice Mode chained three models. OpenAI said this lost information such as tone and multiple speakers, and replies took 2.8–5.4 seconds on average.{c("gpt4o")}</> },
    { statement: myths[1].myth, isMyth: true, explanation: <>{myths[1].fact}{myths[1].src.length > 0 && c(...myths[1].src)}</> },
    { statement: myths[2].myth, isMyth: true, explanation: <>{myths[2].fact}{myths[2].src.length > 0 && c(...myths[2].src)}</> },
    { statement: "Some AI models can operate a computer by looking at screenshots.", isMyth: false, explanation: <>Anthropic released “computer use” as a public beta in October 2024: the model looks at screenshots, then moves the mouse, clicks and types. It was described as experimental.{c("computer-use")}</> },
    { statement: myths[3].myth, isMyth: true, explanation: <>{myths[3].fact}{myths[3].src.length > 0 && c(...myths[3].src)}</> },
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

      <Breadcrumb title="Multimodal models" />
      <ArticleHero
        eyebrow="Foundations · Kinds of models"
        title={TITLE}
        intro="The line between language models and vision models has mostly disappeared. Today's leading models take in text, pictures and sound — and answer in any of them."
        readingMinutes={10}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>A <strong className="text-fg">modality</strong> is a type of data: text, images, audio, video. A <strong className="text-fg">multimodal</strong> model handles several.</>,
              <>The trick: turn everything into <strong className="text-fg">tokens</strong> and place matching meanings close together.</>,
              <>Training one model on all modalities keeps information that chaining separate models used to lose.</>,
              <>They can read documents, discuss photos and talk out loud — but still <strong className="text-fg">misread details and can be tricked</strong>.</>,
            ]}
          />

          <Section id="what" kicker="The idea" title="One model, many senses">
            <p>
              People don&apos;t keep separate brains for reading, seeing and listening. For most of AI&apos;s history, though, models did:
              a <Link href={topicHref("language-models")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">language model</Link>{" "}
              for text, a <Link href={topicHref("vision-models")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">vision model</Link>{" "}
              for images, a speech model for audio.
            </p>
            <p>
              A <strong>multimodal model</strong> handles several types of input — and often output — together. You can show it a photo of
              your fridge and ask what to cook, or point your camera at a sign in another language and hear it read back in yours.
            </p>
            <p>
              The idea built up over a few years: CLIP linked images and captions in 2021,{c("clip")} DeepMind&apos;s Flamingo answered
              questions about images in 2022,{c("flamingo")} and open models like LLaVA connected a vision encoder to a language model in
              2023.{c("llava")} Google described its Gemini models, announced in December 2023, as multimodal from the start.{c("gemini")}
            </p>
          </Section>

          <Section id="meaning" kicker="Try it" title="A shared space for meaning">
            <p>
              The key idea is a <strong>shared meaning space</strong>. The model turns every input — a photo, a sentence, a sound — into a
              long list of numbers, like coordinates. It is trained so that a photo of a dog and the words “a dog catching a ball” end up
              close together. CLIP learned this from 400 million images and their captions.{c("clip")}
            </p>
          </Section>
          <Figure wide caption="An illustrative 2-D map. Real models use hundreds or thousands of dimensions, but the principle is the same: closeness means similar meaning.">
            <MeaningSpace />
          </Figure>
          <div className="mb-16 md:mb-20" />

          <Section id="tokens" kicker="Under the hood" title="Everything becomes tokens">
            <p>
              Once images and sound can be turned into tokens, a single transformer can process them all together. Images are cut into
              patches, as in vision transformers;{c("vit")} audio is sliced into short chunks.{c("whisper")} Your question and your photo
              become one sequence.
            </p>
            <Figure wide caption="A simplified view. Exact designs differ between models, and some generate images or audio as well as reading them.">
              <EverythingTokens />
            </Figure>
          </Section>

          <Section id="native" kicker="Why it matters" title="Chained models vs. one native model">
            <p>
              Before multimodal models, a voice assistant was usually three models in a row: one turned speech into text, a language model
              wrote a reply, and a third read it aloud. It worked, but it was slow and lost information at each step. OpenAI said exactly this
              when it introduced GPT-4o in May 2024 as a single model across text, vision and audio.{c("gpt4o")}
            </p>
          </Section>
          <Figure wide caption="Reply times from OpenAI's GPT-4o announcement: 2.8 s (GPT-3.5) and 5.4 s (GPT-4) on average in the earlier Voice Mode, versus 320 ms on average (232 ms at best) for GPT-4o.">
            <PipelineCompare />
          </Figure>
          <div className="mb-16 md:mb-20" />

          <Section id="can-do" kicker="In practice" title="What multimodal models can do">
            <Figure wide caption="Everyday uses. Quality varies by model and task — check the output when it matters.">
              <Capabilities />
            </Figure>
            <p>
              The newest frontier is <strong>computer use</strong>: the model looks at screenshots of a screen, then moves the mouse, clicks
              and types to complete a task. Anthropic released this as a public beta in October 2024 and called it experimental and at times
              error-prone.{c("computer-use")}
            </p>
          </Section>

          <Section id="limits" kicker="Know the limits" title="Limits and risks">
            <p>
              Multimodal models inherit the weaknesses of both language and vision models. They can <strong>describe objects that aren&apos;t
              in the image</strong> — a 2023 study found several popular vision-language models suffered from severe “object
              hallucination”.{c("pope")} Exact counts, tiny text and precise positions are other common weak spots, so double-check anything that matters.
            </p>
            <Callout label="A new kind of attack">
              Because these models follow instructions, anything they read can contain instructions — including images and audio.
              Researchers showed that an instruction blended invisibly into a picture or sound clip could steer a multimodal model&apos;s
              answers.{c("injection")} Be careful letting a model act on content from sources you don&apos;t trust.
            </Callout>
          </Section>

          <Section id="myths" kicker="Fact check" title="Myth or fact?">
            <p>Six statements about multimodal AI. Some are true, some are popular misconceptions. Can you tell which is which?</p>
            <MythOrFact items={mythOrFact} />
          </Section>

          <Takeaways
            items={[
              "Multimodal models handle text, images and audio in one system.",
              "Everything becomes tokens in a shared space where meaning lines up.",
              "One native model keeps tone and detail that chained models lost — and replies faster.",
              "They still misread details and can be steered by hidden instructions.",
            ]}
          />

          <p className="mb-16 font-casual text-lg text-fg/75 leading-relaxed">
            Next on the map: what happens when a model that can read, see and hear is given tools and a goal —{" "}
            <Link href={topicHref("ai-agents")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
              AI agents
            </Link>
            .
          </p>

          <Sources sources={SOURCES} />
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <KeepGoing slug="multimodal-models" />
    </div>
  );
}
