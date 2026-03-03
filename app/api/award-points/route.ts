import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // important
);

export async function GET() {
  // 1. Get matches where winner is set
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .not("winner", "is", null);

  if (!matches || matches.length === 0) {
    return NextResponse.json({ message: "No completed matches" });
  }

  for (const match of matches) {
    // 2. Get correct predictions not yet awarded
    const { data: predictions } = await supabase
      .from("user_predictions")
      .select("*")
      .eq("match_id", match.id)
      .eq("predicted_team", match.winner)
      .eq("points_awarded", false);

    if (!predictions) continue;

    for (const prediction of predictions) {
      // 3. Add 10 points to user
      await supabase.rpc("increment_points", {
        user_id_input: prediction.user_id,
      });

      // 4. Mark prediction as awarded
      await supabase
        .from("user_predictions")
        .update({ points_awarded: true })
        .eq("id", prediction.id);
    }
  }

  return NextResponse.json({ message: "Points awarded successfully" });
}