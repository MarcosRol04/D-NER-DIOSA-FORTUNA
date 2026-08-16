"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Category, Subcategory, ProductOptionGroup, Product } from "@/lib/types";

type ProductFormProps = {
  categories: Category[];
  subcategories: Subcategory[];
  product?: Product;
};

type DraftChoice = { id: string; label: string; price_delta: string };
type DraftGroup = {
  id: string;
  name: string;
  type: "single" | "multiple";
  required: boolean;
  choices: DraftChoice[];
};

function tempId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ProductForm({ categories, subcategories, product }: ProductFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [subcategoryId, setSubcategoryId] = useState(product?.subcategory_id ?? "");
  const [available, setAvailable] = useState(product?.available ?? true);
  const [displayOrder, setDisplayOrder] = useState(String(product?.display_order ?? 0));
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<DraftGroup[]>(
    (product?.option_groups ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      type: g.type,
      required: g.required,
      choices: g.choices.map((c) => ({
        id: c.id,
        label: c.label,
        price_delta: String(c.price_delta),
      })),
    }))
  );

  const filteredSubcategories = subcategories.filter((s) => s.category_id === categoryId);

  function addGroup() {
    setGroups((prev) => [
      ...prev,
      { id: tempId(), name: "", type: "single", required: false, choices: [] },
    ]);
  }

  function removeGroup(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  function updateGroup(id: string, patch: Partial<DraftGroup>) {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function addChoice(groupId: string) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, choices: [...g.choices, { id: tempId(), label: "", price_delta: "0" }] }
          : g
      )
    );
  }

  function updateChoice(groupId: string, choiceId: string, patch: Partial<DraftChoice>) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              choices: g.choices.map((c) => (c.id === choiceId ? { ...c, ...patch } : c)),
            }
          : g
      )
    );
  }

  function removeChoice(groupId: string, choiceId: string) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, choices: g.choices.filter((c) => c.id !== choiceId) }
          : g
      )
    );
  }

  async function uploadImageIfNeeded(): Promise<string> {
    if (!imageFile) return imageUrl;
    setUploading(true);
    const ext = imageFile.name.split(".").pop();
    const path = `products/${tempId()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, imageFile, { upsert: true });
    setUploading(false);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const finalImageUrl = await uploadImageIfNeeded();

      const payload = {
        name,
        description: description || null,
        ingredients: ingredients || null,
        price: Number(price),
        category_id: categoryId,
        subcategory_id: subcategoryId || null,
        available,
        display_order: Number(displayOrder) || 0,
        image_url: finalImageUrl || null,
      };

      let productId = product?.id;

      if (isEdit && productId) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productId);
        if (updateError) throw updateError;

        // Resetăm complet grupurile de opțiuni pentru simplitate și consistență.
        await supabase.from("product_option_groups").delete().eq("product_id", productId);
      } else {
        const { data, error: insertError } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (insertError) throw insertError;
        productId = data.id;
      }

      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        if (!g.name.trim()) continue;
        const { data: groupRow, error: groupError } = await supabase
          .from("product_option_groups")
          .insert({
            product_id: productId,
            name: g.name,
            type: g.type,
            required: g.required,
            display_order: i,
          })
          .select("id")
          .single();
        if (groupError) throw groupError;

        const choicesPayload = g.choices
          .filter((c) => c.label.trim())
          .map((c, idx) => ({
            group_id: groupRow.id,
            label: c.label,
            price_delta: Number(c.price_delta) || 0,
            display_order: idx,
          }));

        if (choicesPayload.length > 0) {
          const { error: choicesError } = await supabase
            .from("product_option_choices")
            .insert(choicesPayload);
          if (choicesError) throw choicesError;
        }
      }

      router.push("/admin/produse");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "A apărut o eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[13px] font-medium">Nume produs</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-[13px] font-medium">Descriere</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-[13px] font-medium">Ingrediente</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={2}
            className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-medium">Preț (lei)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-medium">Ordine afișare</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-medium">Categorie</label>
          <select
            required
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId("");
            }}
            className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-medium">Subcategorie (opțional)</label>
          <select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          >
            <option value="">Fără subcategorie</option>
            {filteredSubcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-[13px] font-medium">Imagine</label>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="mb-2 h-24 w-24 rounded-[12px] object-cover" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-[13px]"
          />
        </div>

        <label className="flex items-center gap-2 sm:col-span-2 text-[13.5px]">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="h-4 w-4 accent-[--primary-color]"
          />
          Produs disponibil
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold">Opțiuni produs (mărime, extra etc.)</h3>
          <button
            type="button"
            onClick={addGroup}
            className="rounded-pill border border-border px-3 py-1.5 text-[12.5px] font-medium"
          >
            + Grup de opțiuni
          </button>
        </div>

        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="rounded-card border border-border p-3.5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  placeholder="Nume grup (ex: Mărime)"
                  value={g.name}
                  onChange={(e) => updateGroup(g.id, { name: e.target.value })}
                  className="flex-1 min-w-[140px] rounded-[10px] border border-border px-3 py-2 text-[13.5px]"
                />
                <select
                  value={g.type}
                  onChange={(e) => updateGroup(g.id, { type: e.target.value as "single" | "multiple" })}
                  className="rounded-[10px] border border-border px-2 py-2 text-[13px]"
                >
                  <option value="single">O singură opțiune</option>
                  <option value="multiple">Mai multe opțiuni</option>
                </select>
                <label className="flex items-center gap-1.5 text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={g.required}
                    onChange={(e) => updateGroup(g.id, { required: e.target.checked })}
                  />
                  obligatoriu
                </label>
                <button
                  type="button"
                  onClick={() => removeGroup(g.id)}
                  className="text-[12.5px] text-danger"
                >
                  Șterge grup
                </button>
              </div>

              <div className="space-y-1.5">
                {g.choices.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <input
                      placeholder="Opțiune (ex: Mare)"
                      value={c.label}
                      onChange={(e) => updateChoice(g.id, c.id, { label: e.target.value })}
                      className="flex-1 rounded-[10px] border border-border px-3 py-1.5 text-[13px]"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="+ lei"
                      value={c.price_delta}
                      onChange={(e) => updateChoice(g.id, c.id, { price_delta: e.target.value })}
                      className="w-24 rounded-[10px] border border-border px-3 py-1.5 text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => removeChoice(g.id, c.id)}
                      className="text-[12px] text-danger"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addChoice(g.id)}
                  className="text-[12.5px] font-medium text-primary"
                >
                  + Adaugă opțiune
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-[13px] text-danger">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-pill bg-primary px-6 py-3 text-[14.5px] font-semibold text-white disabled:opacity-60"
      >
        {saving || uploading ? "Se salvează..." : "SALVEAZĂ PRODUSUL"}
      </button>
    </form>
  );
}
