"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // 🔐 Replace with your admin email
    if (user.email !== "sportsaichallenge@gmail.com") {
      alert("Unauthorized");
      router.push("/");
      return;
    }

    setUserChecked(true);
    fetchMatches();
  }

  async function fetchMatches() {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("match_date", today)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMatches(data);
    }
  }

  async function runSync() {
    setLoading(true);

    try {
      await fetch("/api/sync-results");
      await fetchMatches();
      alert("Sync completed successfully!");
    } catch (err) {
      alert("Error running sync");
    }

    setLoading(false);
  }

  if (!userChecked) {
    return <div style={{ padding: 40 }}>Checking access...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🛠 Admin Dashboard</h1>

      <br />

      <button
        onClick={runSync}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Syncing..." : "Run Sync Now"}
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h2>Today's Matches</h2>

      {matches.length === 0 && <p>No matches today.</p>}

      <div className="space-y-4">
  {matches.map((match) => (
    <div
      key={match.id}
      className="bg-white p-5 rounded-lg shadow"
    >
      <div className="font-semibold">
        {match.team_1} vs {match.team_2}
      </div>

      <div className="text-sm text-gray-600 mt-2">
        Status: {match.status || "Unknown"}
      </div>

      <div className="text-sm mt-1">
        Winner: {match.winner || "Not decided"}
      </div>
    </div>
  ))}
</div>
    </div>
  );
}