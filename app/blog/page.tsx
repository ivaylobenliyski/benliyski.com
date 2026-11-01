import Link from "next/link";
import { supabase, type Post } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { ArrowIcon } from "@/components/Icons";

export const metadata = {
  title: "Blog — Ivaylo Benliyski",
  description: "Thoughts on AI trends, where the technology is going, and what it means for business.",
};

export const revalidate = 60;

async function getPosts(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("category", "blog")
    .order("published_at", { ascending: false });
  return data ?? [];
}

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
      <PageHeader
        eyebrow="Blog"
        title="AI Trends"
        intro="What's actually happening in AI — and what it means for the industries it's touching."
      />

      {posts.length === 0 ? (
        <EmptyState message="The first essays on AI trends are being written." />
      ) : (
        <ul className="border-t border-line max-w-4xl">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-line">
              <Link href={`/blog/${post.slug}`} className="group grid sm:grid-cols-[9rem_1fr_auto] gap-x-6 gap-y-2 py-7 items-baseline">
                <span className="font-tech text-sm text-fg/50">
                  {post.published_at &&
                    new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span>
                  <span className="block font-tech text-xl font-semibold text-fg group-hover:translate-x-1 transition-transform">
                    {post.title}
                  </span>
                  {post.description && (
                    <span className="block font-casual text-fg/65 mt-1.5 leading-relaxed">{post.description}</span>
                  )}
                </span>
                <ArrowIcon size={18} className="hidden sm:block text-fg/40 group-hover:text-fg transition-colors self-center" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
