"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full rounded-[10px] border border-white/20 px-3 py-2 text-[13px] text-white/70 hover:bg-white/10 md:text-white/60"
    >
      Deconectare
    </button>
  );
}
