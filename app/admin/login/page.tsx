"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("Email sau parolă incorectă.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card border border-border bg-background p-6 shadow-card"
      >
        <h1 className="font-display text-[20px] font-semibold text-center">
          DÖNER DIOSA FORTUNA
        </h1>
        <p className="mt-1 text-center text-[13px] text-ink-soft">
          Panou de administrare
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <label className="mb-1 block text-[13px] font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium">Parolă</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-pill bg-primary px-5 py-3 text-[14.5px] font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Se conectează..." : "Autentificare"}
        </button>
      </form>
    </div>
  );
}
