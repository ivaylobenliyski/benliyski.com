/**
 * Foundations — the "What is AI?" learning map under /vocabulary/foundations.
 *
 * Topics are deliberately unnumbered: the map is a graph, so new topics can be
 * slotted in anywhere by adding an entry here and wiring its `leadsTo` edges.
 * A topic only becomes a link once `status` is "live" and its page exists at
 * app/vocabulary/foundations/<slug>/page.tsx.
 */

export type TopicStatus = "live" | "soon";

export type Cluster = "big-picture" | "how-it-works" | "model-types" | "in-action";

export type Topic = {
  slug: string;
  title: string;
  /** One line for map nodes and cards. */
  tagline: string;
  /** Two or three sentences for the map's preview panel. */
  summary: string;
  status: TopicStatus;
  cluster: Cluster;
  /** Slugs of topics that naturally come next. Drives map lines and "keep going" links. */
  leadsTo: string[];
  /** Position on the desktop map, in percent of the map's width/height. */
  pos: { x: number; y: number };
};

export const FOUNDATIONS_PATH = "/vocabulary/foundations";

export const CLUSTERS: Record<Cluster, { label: string; blurb: string }> = {
  "big-picture": { label: "The big picture", blurb: "What AI is and how we got here." },
  "how-it-works": { label: "How it works", blurb: "How machines learn from data." },
  "model-types": { label: "Kinds of models", blurb: "What different models are built to do." },
  "in-action": { label: "AI in action", blurb: "Systems that use models to get things done." },
};

export const TOPICS: Topic[] = [
  {
    slug: "what-is-ai",
    title: "What is AI?",
    tagline: "AI vs. machine learning vs. deep learning",
    summary:
      "A plain-language definition of artificial intelligence, and how it relates to machine learning, deep learning and generative AI — the nested circles everyone talks about.",
    status: "live",
    cluster: "big-picture",
    leadsTo: ["history-of-ai", "how-machines-learn"],
    pos: { x: 11, y: 30 },
  },
  {
    slug: "history-of-ai",
    title: "History of AI",
    tagline: "From 1943 to today, booms and winters included",
    summary:
      "Eighty years of big promises, funding freezes and breakthroughs: from the first artificial neuron to ChatGPT, Nobel prizes and models that reason step by step.",
    status: "live",
    cluster: "big-picture",
    leadsTo: ["how-machines-learn"],
    pos: { x: 11, y: 74 },
  },
  {
    slug: "how-machines-learn",
    title: "How machines learn",
    tagline: "Data, training and neural networks",
    summary:
      "What “training” actually means: examples, mistakes, small adjustments, repeat. Neural networks explained without the maths.",
    status: "live",
    cluster: "how-it-works",
    leadsTo: ["language-models", "vision-models"],
    pos: { x: 33, y: 52 },
  },
  {
    slug: "language-models",
    title: "Language models",
    tagline: "How ChatGPT, Claude and Gemini work",
    summary:
      "Models that learn from text to predict what comes next — and why that simple trick turns into writing, coding and conversation.",
    status: "live",
    cluster: "model-types",
    leadsTo: ["multimodal-models", "ai-agents"],
    pos: { x: 54, y: 22 },
  },
  {
    slug: "vision-models",
    title: "Vision models",
    tagline: "How computers learn to see",
    summary:
      "From reading handwritten digits to spotting tumours in scans: how models turn pixels into meaning.",
    status: "live",
    cluster: "model-types",
    leadsTo: ["multimodal-models"],
    pos: { x: 54, y: 82 },
  },
  {
    slug: "multimodal-models",
    title: "Multimodal models",
    tagline: "Text, images and sound in one model",
    summary:
      "Why the line between language and vision models has mostly disappeared, and what it means when one model can read, look and listen.",
    status: "live",
    cluster: "model-types",
    leadsTo: ["ai-agents"],
    pos: { x: 69, y: 52 },
  },
  {
    slug: "ai-agents",
    title: "AI agents",
    tagline: "Models that plan, use tools and act",
    summary:
      "What happens when a model doesn't just answer, but takes steps: searching, using apps, writing code and checking its own work — and why that's powerful and risky.",
    status: "live",
    cluster: "in-action",
    leadsTo: [],
    pos: { x: 89, y: 52 },
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

export function topicHref(slug: string): string {
  return `${FOUNDATIONS_PATH}/${slug}`;
}

/** Topics that link into `slug` on the map. */
export function topicsLeadingTo(slug: string): Topic[] {
  return TOPICS.filter((t) => t.leadsTo.includes(slug));
}

export const LIVE_TOPICS = TOPICS.filter((t) => t.status === "live");
