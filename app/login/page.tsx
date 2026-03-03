"use client";

import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Check if user exists
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!data) {
      await supabase.from("users").insert([
        {
          id: user.id,
          name: user.user_metadata?.full_name || "User",
          email: user.email,
        },
      ]);
    }

    window.location.href = redirectTo;
  }

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login?redirect=${redirectTo}`,
      },
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>
      <button onClick={signIn} style={{ padding: 10 }}>
        Login with Google
      </button>
    </div>
  );
}