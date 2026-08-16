"use client";

import { useEffect, useState } from "react";
import {
  Category,
  Subcategory,
  Product,
  RestaurantSettings,
  CartItem,
  SelectedOption,
} from "@/lib/types";
import { addToCart, buildLineId, cartCount, clearCart, readCart, updateQuantity } from "@/lib/cart";
import Header from "./Header";
import CategoryNav from "./CategoryNav";
import ProductList from "./ProductList";
import ProductOptionsSheet from "./ProductOptionsSheet";
import CartDrawer from "./CartDrawer";
import WaiterScreen from "./WaiterScreen";
import EmptyState from "./EmptyState";

type MenuAppProps = {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  settings: RestaurantSettings | null;
};

export default function MenuApp({
  categories,
  subcategories,
  products,
  settings,
}: MenuAppProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [waiterOpen, setWaiterOpen] = useState(false);

  useEffect(() => {
    setCart(readCart());
    const handler = () => setCart(readCart());
    window.addEventListener("ddf-cart-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("ddf-cart-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  function handleAdd(product: Product) {
    const hasOptions = (product.option_groups?.length ?? 0) > 0;
    if (hasOptions) {
      setDetailProduct(product);
      return;
    }
    addToCart({
      line_id: buildLineId(product.id, []),
      product_id: product.id,
      name: product.name,
      unit_price: product.price,
      base_price: product.price,
      image_url: product.image_url,
      selected_options: [],
    });
  }

  function handleConfirmOptions(selected: SelectedOption[], quantity: number) {
    if (!detailProduct) return;
    const unitPrice =
      detailProduct.price + selected.reduce((s, o) => s + o.price_delta, 0);
    addToCart({
      line_id: buildLineId(detailProduct.id, selected),
      product_id: detailProduct.id,
      name: detailProduct.name,
      unit_price: unitPrice,
      base_price: detailProduct.price,
      image_url: detailProduct.image_url,
      selected_options: selected,
      quantity,
    });
    setDetailProduct(null);
  }

  const activeProducts = products.filter((p) => p.category_id === activeCategory);
  const activeSubcategories = subcategories.filter(
    (s) => s.category_id === activeCategory
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header
        name={settings?.name ?? "DÖNER DIOSA FORTUNA"}
        logoUrl={settings?.logo_url ?? null}
        cartCount={cartCount(cart)}
        onOpenCart={() => setCartOpen(true)}
      />

      {settings?.description && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <p className="text-[13.5px] text-ink-soft">{settings.description}</p>
        </div>
      )}

      <CategoryNav
        categories={categories}
        activeId={activeCategory}
        onSelect={setActiveCategory}
      />

      <main className="mx-auto max-w-2xl px-4 py-5">
        {categories.length === 0 ? (
          <EmptyState
            title="MOMENTAN NU EXISTĂ PRODUSE DISPONIBILE."
            subtitle="Meniul va fi disponibil în curând."
          />
        ) : (
          <ProductList
            products={activeProducts}
            subcategories={activeSubcategories}
            onAdd={handleAdd}
            onOpenDetail={(p) => setDetailProduct(p)}
          />
        )}
      </main>

      {detailProduct && (
        <ProductOptionsSheet
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onConfirm={handleConfirmOptions}
        />
      )}

      {cartOpen && (
        <CartDrawer
          items={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={(lineId, qty) => setCart(updateQuantity(lineId, qty))}
          onClear={() => setCart(clearCart())}
          onShowWaiter={() => {
            setCartOpen(false);
            setWaiterOpen(true);
          }}
        />
      )}

      {waiterOpen && (
        <WaiterScreen
          items={cart}
          onClose={() => {
            setWaiterOpen(false);
            setCartOpen(true);
          }}
        />
      )}
    </div>
  );
}