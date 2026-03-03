"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("points", { ascending: false });

    setUsers(data || []);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-10 text-emerald-600">
        Leaderboard
      </h1>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`flex justify-between items-center px-8 py-5 border-b border-gray-200 last:border-none ${
              index === 0 ? "bg-yellow-50" : ""
            }`}
          >
            <span className="font-medium">
              #{index + 1} {user.name}
            </span>

            <span className="text-emerald-600 font-semibold">
              {user.points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}