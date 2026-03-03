"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PredictPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [userPredictions, setUserPredictions] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMatches();
    fetchUserPredictions();
  }, []);

  async function fetchMatches() {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("match_date", today);

    setMatches(data || []);
  }

  async function fetchUserPredictions() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("user_predictions")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      const map: Record<string, string> = {};
      data.forEach((p) => {
        map[p.match_id] = p.predicted_team;
      });
      setUserPredictions(map);
    }
  }

  async function submitPrediction(match: any, selectedTeam: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login?redirect=/predict";
      return;
    }

    if (userPredictions[match.id]) return;

    await supabase.from("user_predictions").insert([
      {
        user_id: user.id,
        match_id: match.id,
        predicted_team: selectedTeam,
      },
    ]);

    setUserPredictions((prev) => ({
      ...prev,
      [match.id]: selectedTeam,
    }));
  }

  function getTeamLogo(team: string) {
    const logos: Record<string, string> = {
      India: "https://flagcdn.com/w40/in.png",
      Australia: "https://flagcdn.com/w40/au.png",
      England: "https://flagcdn.com/w40/gb-eng.png",
      Pakistan: "https://flagcdn.com/w40/pk.png",
      Zimbabwe: "https://flagcdn.com/w40/zw.png",
      "South Africa":"https://flagcdn.com/w40/za.png",
      "West Indies":"https://flagcdn.com/w40/jm.png",
      "New Zealand":"https://flagcdn.com/w40/nz.png"
    };
    return logos[team] || "https://via.placeholder.com/40";
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-10 text-emerald-600">
        Match Day Predictions
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 text-xl font-semibold">
                <img src={getTeamLogo(match.team_1)} className="w-8 h-8" />
                {match.team_1}
              </div>

              <div className="text-gray-400 my-2">VS</div>

              <div className="flex items-center justify-center gap-3 text-xl font-semibold">
                <img src={getTeamLogo(match.team_2)} className="w-8 h-8" />
                {match.team_2}
              </div>
            </div>

            <div className="flex gap-4">
              {[match.team_1, match.team_2].map((team) => (
                <button
                  key={team}
                  onClick={() => submitPrediction(match, team)}
                  disabled={!!userPredictions[match.id]}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all duration-300 transform
                    ${
                      userPredictions[match.id] === team
                        ? "bg-yellow-400 text-black scale-105 shadow-lg"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105"
                    }
                    ${userPredictions[match.id] ? "opacity-70 cursor-not-allowed" : ""}
                  `}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}