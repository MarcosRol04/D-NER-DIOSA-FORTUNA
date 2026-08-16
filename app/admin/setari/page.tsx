import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/admin/SettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-[22px] font-semibold mb-5">SETĂRI RESTAURANT</h1>
      <SettingsForm settings={settings ?? null} />
    </div>
  );
}
