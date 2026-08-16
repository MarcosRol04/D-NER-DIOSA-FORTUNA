"use client";

import { CartItem, SelectedOption } from "./types";

const STORAGE_KEY = "ddf_cos_selectie";

// Generează un id de linie stabil pe baza produsului + opțiunilor alese,
// astfel încât aceeași combinație să se acumuleze în aceeași linie din coș.
export function buildLineId(productId: string, options: SelectedOption[]) {
  const optionsKey = options
    .map((o) => o.choice_id)
    .sort()
    .join(",");
  return `${productId}::${optionsKey}`;
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("ddf-cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity"> & { quantity?: number }) {
  const items = readCart();
  const existingIndex = items.findIndex((i) => i.line_id === item.line_id);
  const qty = item.quantity ?? 1;

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + qty,
    };
  } else {
    items.push({ ...item, quantity: qty });
  }

  writeCart(items);
  return items;
}

export function updateQuantity(lineId: string, quantity: number) {
  let items = readCart();
  if (quantity <= 0) {
    items = items.filter((i) => i.line_id !== lineId);
  } else {
    items = items.map((i) => (i.line_id === lineId ? { ...i, quantity } : i));
  }
  writeCart(items);
  return items;
}

export function removeFromCart(lineId: string) {
  const items = readCart().filter((i) => i.line_id !== lineId);
  writeCart(items);
  return items;
}

export function clearCart() {
  writeCart([]);
  return [];
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
}
