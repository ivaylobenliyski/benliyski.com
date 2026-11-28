/** Server-only Supabase access for the Hans demo (service-role key; tables have RLS on and no public policies). */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Appointment } from "./state";

let admin: SupabaseClient | null = null;

export function db(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return (admin ??= createClient(url, key, { auth: { persistSession: false } }));
}

export async function takenSlots(kind: string): Promise<Set<string>> {
  const { data } = await db()!.from("hans_appointments").select("slot").eq("kind", kind);
  return new Set((data ?? []).map((r: { slot: string }) => r.slot));
}

export async function bookSlot(chatId: string, a: Appointment): Promise<boolean> {
  const { error } = await db()!.from("hans_appointments").insert({ ...a, chat_id: chatId });
  if (error?.code === "23505") return false; // primary key (kind, slot) already taken
  if (error) throw new Error(error.message);
  return true;
}
