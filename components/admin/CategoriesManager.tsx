"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, Subcategory } from "@/lib/types";

type CategoriesManagerProps = {
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
};

export default function CategoriesManager({
  initialCategories,
  initialSubcategories,
}: CategoriesManagerProps) {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState<Record<string, string>>({});

  async function addCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, display_order: categories.length, active: true })
      .select("*")
      .single();
    if (!error && data) {
      setCategories((prev) => [...prev, data]);
      setNewCategoryName("");
    }
  }

  async function renameCategory(cat: Category, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, name } : c)));
    await supabase.from("categories").update({ name }).eq("id", cat.id);
  }

  async function toggleCategoryActive(cat: Category) {
    const next = !cat.active;
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, active: next } : c)));
    await supabase.from("categories").update({ active: next }).eq("id", cat.id);
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`Ștergi categoria „${cat.name}” și subcategoriile ei?`)) return;
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setSubcategories((prev) => prev.filter((s) => s.category_id !== cat.id));
    await supabase.from("categories").delete().eq("id", cat.id);
  }

  async function addSubcategory(categoryId: string) {
    const name = (newSubcategoryName[categoryId] ?? "").trim();
    if (!name) return;
    const order = subcategories.filter((s) => s.category_id === categoryId).length;
    const { data, error } = await supabase
      .from("subcategories")
      .insert({ category_id: categoryId, name, display_order: order, active: true })
      .select("*")
      .single();
    if (!error && data) {
      setSubcategories((prev) => [...prev, data]);
      setNewSubcategoryName((prev) => ({ ...prev, [categoryId]: "" }));
    }
  }

  async function renameSubcategory(sub: Subcategory, name: string) {
    setSubcategories((prev) => prev.map((s) => (s.id === sub.id ? { ...s, name } : s)));
    await supabase.from("subcategories").update({ name }).eq("id", sub.id);
  }

  async function toggleSubcategoryActive(sub: Subcategory) {
    const next = !sub.active;
    setSubcategories((prev) => prev.map((s) => (s.id === sub.id ? { ...s, active: next } : s)));
    await supabase.from("subcategories").update({ active: next }).eq("id", sub.id);
  }

  async function deleteSubcategory(sub: Subcategory) {
    if (!confirm(`Ștergi subcategoria „${sub.name}”?`)) return;
    setSubcategories((prev) => prev.filter((s) => s.id !== sub.id));
    await supabase.from("subcategories").delete().eq("id", sub.id);
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nume categorie nouă (ex: MÂNCARE)"
          className="flex-1 rounded-[10px] border border-border px-3 py-2.5 text-[14px]"
        />
        <button
          onClick={addCategory}
          className="rounded-pill bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-white"
        >
          + Categorie
        </button>
      </div>

      {categories.length === 0 && (
        <p className="rounded-card border border-dashed border-border px-5 py-10 text-center text-[13.5px] text-ink-soft">
          Nu există categorii încă. Adaugă prima categorie mai sus.
        </p>
      )}

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-card border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={cat.name}
                onChange={(e) => renameCategory(cat, e.target.value)}
                className="flex-1 min-w-[140px] rounded-[10px] border border-border px-3 py-2 text-[14px] font-semibold"
              />
              <button
                onClick={() => toggleCategoryActive(cat)}
                className="rounded-pill border border-border px-3 py-1.5 text-[12.5px] font-medium"
              >
                {cat.active ? "Dezactivează" : "Activează"}
              </button>
              <button
                onClick={() => deleteCategory(cat)}
                className="rounded-pill border border-danger/30 px-3 py-1.5 text-[12.5px] font-medium text-danger"
              >
                Șterge
              </button>
            </div>

            <div className="mt-3 space-y-2 pl-2 border-l-2 border-border">
              {subcategories
                .filter((s) => s.category_id === cat.id)
                .map((sub) => (
                  <div key={sub.id} className="flex flex-wrap items-center gap-2 pl-2">
                    <input
                      value={sub.name}
                      onChange={(e) => renameSubcategory(sub, e.target.value)}
                      className="flex-1 min-w-[120px] rounded-[10px] border border-border px-2.5 py-1.5 text-[13px]"
                    />
                    <button
                      onClick={() => toggleSubcategoryActive(sub)}
                      className="rounded-pill border border-border px-2.5 py-1 text-[11.5px] font-medium"
                    >
                      {sub.active ? "Dezactivează" : "Activează"}
                    </button>
                    <button
                      onClick={() => deleteSubcategory(sub)}
                      className="rounded-pill border border-danger/30 px-2.5 py-1 text-[11.5px] font-medium text-danger"
                    >
                      Șterge
                    </button>
                  </div>
                ))}

              <div className="flex gap-2 pl-2 pt-1">
                <input
                  value={newSubcategoryName[cat.id] ?? ""}
                  onChange={(e) =>
                    setNewSubcategoryName((prev) => ({ ...prev, [cat.id]: e.target.value }))
                  }
                  placeholder="Subcategorie nouă (opțional)"
                  className="flex-1 min-w-[120px] rounded-[10px] border border-border px-2.5 py-1.5 text-[13px]"
                />
                <button
                  onClick={() => addSubcategory(cat.id)}
                  className="rounded-pill border border-border px-3 py-1.5 text-[12px] font-medium"
                >
                  + Subcategorie
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
