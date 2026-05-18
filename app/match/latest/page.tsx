import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LatestMatchPage() {
  const supabase = await createClient();
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (match?.id) {
    redirect(`/match/${match.id}`);
  }

  redirect("/match/demo-match-id");
}
