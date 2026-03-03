"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState("/");

  // Read ?redirect=... only in the browser
  useEffect(() => {
    const url = new URL(window.location.href);
    setRedirectTo(url.searchParams.get("redirect") || "/");
  }, []);

  useEffect(() => {
    // Wait until redirectTo is known
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTo]);

  async function checkUser() {
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("supabase.auth.getUser error:", authError);
      return;
    }

    const user = data.user;
    if (!user) return;

    // Create user row if missing
    const { data: existing, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("users select error:", error);
      // You may still redirect even if this check fails
      router.replace(redirectTo);
      return;
    }

    if (!existing) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id,
          name: user.user_metadata?.full_name || "User",
          email: user.email,
        },
      ]);

      if (insertError) {
        console.error("users insert error:", insertError);
      }
    }

    router.replace(redirectTo);
  }

  const signIn = async () => {
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Supabase returns here after Google login; then checkUser() sends to redirectTo
        redirectTo: `${origin}/login?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      console.error("signInWithOAuth error:", error);
      alert("Login failed. Please try again.");
    }
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