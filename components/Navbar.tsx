"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-emerald-600">
          🏏 T20 Predictor
        </div>

        <div className="space-x-8 text-sm font-medium text-gray-700">
          <a href="/">Home</a>
          <a href="/predict">Predict</a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/admin">Admin</a>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">{user.email}</span>
              <button
                onClick={logout}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </div>
  );
}