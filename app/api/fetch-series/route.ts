import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const seriesId = process.env.CURRENT_SERIES_ID;
    console.log("Current seriesId:", seriesId);
    const url = `https://api.cricapi.com/v1/series_info?apikey=${process.env.CRICKET_API_KEY}&id=${seriesId}`;

    const res = await fetch(url);
    const json = await res.json();

    const matches = json.data?.matchList ?? [];
    console.log("Current Series matches:", matches);
    if (!matches.length) {
      return Response.json({ message: "No matches found in series" });
    }

    const normalized = matches.map((m: any) => ({
      external_match_id: m.id,
      match_date: m.dateTimeGMT?.split("T")[0],
      tournament: json.data?.name ?? "T20 World Cup",
      team_1: m.teams?.[0] ?? "TBD",
      team_2: m.teams?.[1] ?? "TBD",
      format: m.matchType ?? "T20",
      venue: m.venue ?? "Unknown",
      status: m.status ?? "scheduled",
      pitch: "unknown",
      recent_form: {
        [m.teamInfo?.[0]?.name]: "not available",
        [m.teamInfo?.[1]?.name]: "not available",
      },
    }));

    const { error } = await supabase
      .from("matches")
      .upsert(normalized, { onConflict: "external_match_id" });

    if (error) {
      console.error(error);
      return Response.json({ error: "Insert failed" }, { status: 500 });
    }

    return Response.json({
      inserted: normalized.length,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch series" }, { status: 500 });
  }
}