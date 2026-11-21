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
import PixelsAndFilters from "@/components/foundations/vision-models/PixelsAndFilters";
import { DiffusionStrip, FooledFigure, HeroArt, PatchesFigure, VisionTasks } from "@/components/foundations/vision-models/Figures";
import MythOrFact, { type MythOrFactItem } from "@/components/foundations/MythOrFact";
import { topicHref } from "@/lib/foundations";
import { SOURCES } from "./data";

const PATH = topicHref("vision-models");
const TITLE = "How Vision Models Work: How Computers Learn to See";
const DESCRIPTION =
  "How computer vision models work, in plain language: images as numbers, convolutional networks and filters (try one yourself), vision transformers, CLIP, image generation with diffusion, real-world uses and how models get fooled — with sources.";
const CHECKED = "2026-11-21";

export const metadata: Metadata = {
  title: `${TITLE} — Ivaylo Benliyski`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, type: "article" },
};

const TOC = [
  { id: "numbers", label: "A picture is a grid of numbers" },
  { id: "jobs", label: "What vision models do" },
  { id: "cnn", label: "Convolutional networks" },
  { id: "transformers", label: "Vision transformers" },
  { id: "clip", label: "Learning from captions" },
  { id: "generation", label: "Generating images" },
  { id: "in-use", label: "Where you meet them" },
  { id: "fooled", label: "How they get fooled" },
  { id: "myths", label: "Myth or fact?" },
  { id: "sources", label: "Sources" },
];

export default function VisionModels() {
  const c = (...ids: string[]) => <Cite ids={ids} sources={SOURCES} />;

  const myths: { myth: string; fact: React.ReactNode; src: string[] }[] = [
    {
      myth: "Vision models see the way we do.",
      fact: "They can score very highly on benchmarks, yet be fooled by invisible noise or rely on texture where people use shape.",
      src: ["adversarial", "texture"],
    },
    {
      myth: "Computer vision is a recent invention.",
      fact: "Neural networks were reading handwritten digits, including on bank cheques, in the 1990s. What changed after 2012 was scale: more data and faster chips.",
      src: ["lenet", "alexnet"],
    },
    {
      myth: "If it's accurate overall, it's accurate for everyone.",
      fact: "An overall score can hide big gaps. Commercial face-analysis systems were far less accurate for darker-skinned women than for lighter-skinned men.",
      src: ["gender-shades"],
    },
    {
      myth: "Image generators paste together bits of existing photos.",
      fact: "Diffusion models start from random noise and repeatedly remove noise, guided by your description, producing new pixels rather than copying pieces.",
      src: ["ddpm", "latent-diffusion"],
    },
  ];

  const mythOrFact: MythOrFactItem[] = [
    { statement: myths[0].myth, isMyth: true, explanation: <>{myths[0].fact}{myths[0].src.length > 0 && c(...myths[0].src)}</> },
    { statement: "Adding noise people can't see can make a vision model mistake a panda for a gibbon.", isMyth: false, explanation: <>In a famous example, a tiny calculated change turned “panda, 57.7%” into “gibbon, 99.3%” — while the photo looked identical to people.{c("adversarial")}</> },
    { statement: myths[1].myth, isMyth: true, explanation: <>{myths[1].fact}{myths[1].src.length > 0 && c(...myths[1].src)}</> },
    { statement: myths[2].myth, isMyth: true, explanation: <>{myths[2].fact}{myths[2].src.length > 0 && c(...myths[2].src)}</> },
    { statement: "One influential vision model learned from 400 million images paired with captions from the web.", isMyth: false, explanation: <>OpenAI&apos;s CLIP (2021) learned which caption goes with which picture, and matched a classic ImageNet model without using any of its labels.{c("clip")}</> },
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

      <Breadcrumb title="Vision models" />
      <ArticleHero
        eyebrow="Foundations · Kinds of models"
        title={TITLE}
        intro="A computer never sees a cat — only a grid of numbers. Here's how models learn to turn those numbers into meaning, and even into new pictures."
        readingMinutes={11}
        checked={CHECKED}
        art={<HeroArt />}
      />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-16">
        <article className="min-w-0 max-w-3xl">
          <TLDR
            points={[
              <>To a computer, an image is just a <strong className="text-fg">grid of numbers</strong> — brightness and colour for each pixel.</>,
              <>Vision models learn <strong className="text-fg">filters</strong> that pick out edges, then shapes, then whole objects.</>,
              <>They can <strong className="text-fg">classify, locate, outline and generate</strong> images — and now also link pictures with words.</>,
              <>They&apos;re powerful but brittle: <strong className="text-fg">tiny changes can fool them</strong>, and they inherit gaps in their data.</>,
            ]}
          />

          <Section id="numbers" kicker="Start here" title="A picture is a grid of numbers">
            <p>
              Every digital image is made of <strong>pixels</strong>, and every pixel is stored as numbers: one for brightness in a
              black-and-white image, three (red, green and blue) in a colour one. A phone photo has millions of them. Before a model can
              recognise anything, all it has is that grid.
            </p>
            <p>
              Vision models find patterns in the grid using <strong>filters</strong>: small grids of numbers slid across the image. Try it —
              this is the real calculation, running in your browser:
            </p>
          </Section>
          <Figure wide caption="A real 3×3 convolution on a 16×16 image. A convolutional network's first layer learns filters much like these by itself.">
            <PixelsAndFilters />
          </Figure>
          <div className="mb-16 md:mb-20" />

          <Section id="jobs" kicker="The four jobs" title="What vision models do">
            <p>Most vision systems do one (or more) of four jobs. Each is harder than the last.{c("imagenet", "yolo", "sam", "latent-diffusion")}</p>
            <Figure wide caption="The same scene, four different tasks. Real systems often combine them — a self-driving car detects and segments at the same time.">
              <VisionTasks />
            </Figure>
            <p>
              Segmentation has become much easier to use: Meta&apos;s 2023 <strong>Segment Anything</strong> model was trained on more than
              a billion outlines across 11 million images, and can cut out almost any object you point at.{c("sam")}
            </p>
          </Section>

          <Section id="cnn" kicker="The classic design" title="Convolutional networks: filters on filters">
            <p>
              A <strong>convolutional neural network (CNN)</strong>{" "}stacks many layers of filters. Nobody designs them by hand — the network
              learns them during training. In 1998, Yann LeCun&apos;s team used this design to read handwritten digits on cheques.{c("lenet")}
            </p>
            <p>
              The first layer learns simple filters like the edge detectors above. Each later layer combines the previous layer&apos;s
              results, so the network builds up from edges to textures, to parts like eyes and wheels, to whole objects.{c("zeiler")}
            </p>
            <Callout label="The 2012 turning point">
              CNNs became the standard after AlexNet won the ImageNet challenge in 2012, trained on 1.2 million labelled photos using
              graphics cards. Its error rate was 15.3%, against 26.2% for the next-best entry.{c("alexnet", "imagenet")}
            </Callout>
          </Section>

          <Section id="transformers" kicker="Borrowed from language" title="Vision transformers: images as “words”">
            <p>
              In 2020, Google researchers took the transformer — the design behind language models — and applied it to pictures. Their trick
              was to cut an image into small square <strong>patches</strong> and feed them in as a sequence, like words in a sentence.
              Trained on enough data, these <strong>vision transformers</strong> matched or beat the best CNNs.{c("vit")}
            </p>
            <Figure wide caption="A vision transformer reads an image as a sequence of patches. The original paper used patches of 16×16 pixels — hence its title, “An image is worth 16x16 words”.">
              <PatchesFigure />
            </Figure>
          </Section>

          <Section id="clip" kicker="Words meet pictures" title="Learning from captions">
            <p>
              Labelling millions of images by hand is slow. In 2021, OpenAI&apos;s <strong>CLIP</strong> took a shortcut: it learned from 400
              million images paired with the text found next to them online, learning which caption goes with which picture.{c("clip")}
            </p>
            <p>
              The result could recognise categories it was never explicitly trained on — just from their names. On ImageNet, without using any
              of its training labels, CLIP matched the accuracy of a classic network trained on 1.28 million labelled examples.{c("clip")} Linking
              images and language like this is the bridge to <strong>multimodal models</strong>, the next stop on the map.
            </p>
          </Section>

          <Section id="generation" kicker="Making pictures" title="Generating images with diffusion">
            <p>
              Many of today&apos;s image generators are <strong>diffusion models</strong>. During training, they see images with increasing
              amounts of random noise added and learn to predict that noise so it can be removed. To create a picture, they run the process in
              reverse: start from pure noise and clean it up step by step, guided by your text description.{c("ddpm", "latent-diffusion")}
            </p>
            <Figure wide caption="An illustration of the idea. A real generator takes tens of steps and works on a compressed version of the image, but the direction is the same: from noise to picture.">
              <DiffusionStrip />
            </Figure>
          </Section>

          <Section id="in-use" kicker="Everyday vision" title="Where you meet vision models">
            <p>
              Vision models already run quietly in daily life: unlocking your phone with your face, blurring the background on video calls,
              reading number plates, sorting parcels, checking products on factory lines and helping cars stay in lane.
            </p>
            <p>
              Medicine is one of the biggest areas. The US Food and Drug Administration&apos;s public list of AI-enabled medical devices now
              runs to well over a thousand entries, and roughly three quarters of them are in radiology — reading X-rays, CT and MRI scans.{c("fda")}
            </p>
          </Section>

          <Section id="fooled" kicker="Know the limits" title="How vision models get fooled">
            <p>
              Vision models can be accurate and still fail in ways a person never would. Two famous examples from the research literature:{c("adversarial", "texture")}
            </p>
            <Figure wide caption="Results from Goodfellow et al. (2015) and Geirhos et al. (2019). Researchers have since made models more robust, but neither problem is fully solved.">
              <FooledFigure />
            </Figure>
            <p>
              They also learn whatever gaps their data has. Commercial face-analysis systems tested in 2018 had error rates of up to 34.7% for
              darker-skinned women, compared with at most 0.8% for lighter-skinned men.{c("gender-shades")}
            </p>
          </Section>

          <Section id="myths" kicker="Fact check" title="Myth or fact?">
            <p>Six statements about vision models. Some are true, some are popular misconceptions. Can you tell which is which?</p>
            <MythOrFact items={mythOrFact} />
          </Section>

          <Takeaways
            items={[
              "Images are grids of numbers; vision models learn patterns in them.",
              "Layers of filters build up from edges to shapes to whole objects.",
              "Transformers and caption-trained models like CLIP link vision with language.",
              "Strong but brittle: test on varied, representative images.",
            ]}
          />

          <p className="mb-16 font-casual text-lg text-fg/75 leading-relaxed">
            Filters, layers and training are explained step by step in{" "}
            <Link href={topicHref("how-machines-learn")} className="text-fg underline decoration-sage underline-offset-4 hover:decoration-fg">
              How machines learn
            </Link>
            .
          </p>
        </article>
        <aside>
          <OnThisPage items={TOC} />
        </aside>
      </div>

      <KeepGoing slug="vision-models" />

      <div className="max-w-3xl mt-16">
        <Sources sources={SOURCES} />
      </div>
    </div>
  );
}
