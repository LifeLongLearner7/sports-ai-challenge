import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // 1️⃣ Get today's matches from DB
  const today = new Date().toISOString().split("T")[0];

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("match_date", today);

  if (!matches || matches.length === 0) {
    return NextResponse.json({ message: "No matches today" });
  }

  for (const match of matches) {
  if (!match.external_match_id) continue;

  const response = await fetch(
    `https://api.cricapi.com/v1/match_info?apikey=${process.env.CRICKET_API_KEY}&id=${match.external_match_id}`
  );

  const result = await response.json();
  console.log("Current result:", result);
  if (!result.data) continue;

  const apiMatch = result.data;

  // 🔎 IMPORTANT: Check status first
  if (!apiMatch.matchEnded) {
    continue; // skip live/upcoming matches
  }

  const winner = apiMatch.matchWinner;

  // Only update if winner exists AND not already set
  if (winner && match.winner !== winner) {
    await supabase
      .from("matches")
      .update({
        winner: winner,
        status: "completed",
      })
      .eq("id", match.id);

    await fetch(`${process.env.BASE_URL}/api/award-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ match_id: match.id }),
    });
  }
}

  return NextResponse.json({ message: "Results synced" });
}