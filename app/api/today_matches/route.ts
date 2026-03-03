import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  console.log("Current date today:", today);
  const { data } = await supabase
    .from("matches")
    .select("id, team_1, team_2, format, venue, status")
    .eq("match_date", today);

  return Response.json(data ?? []);
}