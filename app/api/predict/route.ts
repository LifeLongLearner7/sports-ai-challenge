"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PredictPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState("");

  useEffect(() => {
    fetchTodayMatches();
  }, []);

  async function fetchTodayMatches() {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("match_date", today);

    if (error) {
      console.error(error);
    } else {
      setMatches(data || []);
    }
  }

  async function submitPrediction() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    if (!selectedMatch) {
      alert("Please select a match");
      return;
    }

    const { error } = await supabase.from("user_predictions").insert([
      {
        user_id: user.id,
        match_id: selectedMatch.id,
        predicted_team: selectedTeam,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error saving prediction");
    } else {
      alert("Prediction submitted!");
      setSelectedTeam("");
    }
  }

  if (matches.length === 0) {
    return <div style={{ padding: 40 }}>No matches today.</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Predict Today’s Matches</h1>

      {/* MATCH SELECTOR */}
      <h3>Select Match</h3>
      <select
        value={selectedMatch?.id || ""}
        onChange={(e) => {
          const match = matches.find((m) => m.id === e.target.value);
          setSelectedMatch(match);
          setSelectedTeam("");
        }}
        style={{ padding: 10 }}
      >
        <option value="">Select Match</option>
        {matches.map((match) => (
          <option key={match.id} value={match.id}>
            {match.team_1} vs {match.team_2}
          </option>
        ))}
      </select>

      {/* TEAM SELECTOR */}
      {selectedMatch && (
        <>
          <br /><br />
          <h3>Select Winner</h3>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{ padding: 10 }}
          >
            <option value="">Select Team</option>
            <option value={selectedMatch.team_1}>
              {selectedMatch.team_1}
            </option>
            <option value={selectedMatch.team_2}>
              {selectedMatch.team_2}
            </option>
          </select>

          <br /><br />

          <button
            onClick={submitPrediction}
            style={{ padding: 10 }}
            disabled={!selectedTeam}
          >
            Submit Prediction
          </button>
        </>
      )}
    </div>
  );
}