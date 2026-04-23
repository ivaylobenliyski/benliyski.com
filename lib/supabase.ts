import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(url, key);

export type Post = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  published_at: string | null;
  published: boolean;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: "live" | "in-progress" | "planned";
  tags: string[] | null;
  url: string | null;
  display_order: number;
  created_at: string;
};
