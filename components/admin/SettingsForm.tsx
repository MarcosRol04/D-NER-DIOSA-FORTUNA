"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RestaurantSettings } from "@/lib/types";

export default function SettingsForm({ settings }: { settings: RestaurantSettings | null }) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(settings?.name ?? "DÖNER DIOSA FORTUNA");
  const [description, setDescription] = useState(settings?.description ?? "");
  const [address, setAddress] = useState(settings?.address ?? "");
  const [phone, setPhone] = useState(settings?.phone ?? "");
  const [openingHours, setOpeningHours] = useState(settings?.opening_hours ?? "");
  const [logoUrl, setLogoUrl] = useState(settings?.logo_url ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMsg(false);

    try {
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `logo/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        finalLogoUrl = `${data.publicUrl}?v=${Date.now()}`;
      }

      const payload = {
        name,
        description: description || null,
        address: address || null,
        phone: phone || null,
        opening_hours: openingHours || null,
        logo_url: finalLogoUrl || null,
      };

      if (settings?.id) {
        const { error: updateError } = await supabase
          .from("restaurant_settings")
          .update(payload)
          .eq("id", settings.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("restaurant_settings")
          .insert(payload);
        if (insertError) throw insertError;
      }

      setLogoUrl(finalLogoUrl);
      setSavedMsg(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "A apărut o eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-[13px] font-medium">Nume restaurant</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px]"
        />
      </div>

      <div>
        <label className="mb-1 block text-[13px] font-medium">Descriere (sub cabecera)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px]"
        />
      </div>

      <div>
        <label className="mb-1 block text-[13px] font-medium">Logo</label>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="mb-2 h-16 w-16 rounded-full object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          className="text-[13px]"
        />
      </div>

      <div>
        <label className="mb-1 block text-[13px] font-medium">Adresă</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px]"
        />
      </div>

      <div>
        <label className="mb-1 block text-[13px] font-medium">Telefon</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px]"
        />
      </div>

      <div>
        <label className="mb-1 block text-[13px] font-medium">Program</label>
        <input
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          placeholder="ex: Luni–Duminică, 11:00–23:00"
          className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px]"
        />
      </div>

      {error && <p className="text-[13px] text-danger">{error}</p>}
      {savedMsg && <p className="text-[13px] text-success">Setările au fost salvate.</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-pill bg-primary px-6 py-3 text-[14.5px] font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Se salvează..." : "Salvează setările"}
      </button>
    </form>
  );
}
