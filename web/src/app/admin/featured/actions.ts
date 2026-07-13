"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function addFeatured(projectId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("featured_projects")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? 0) + 1;
  await supabase
    .from("featured_projects")
    .insert({ project_id: projectId, position });
  revalidatePath("/");
}

export async function removeFeatured(projectId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("featured_projects").delete().eq("project_id", projectId);
  revalidatePath("/");
}
