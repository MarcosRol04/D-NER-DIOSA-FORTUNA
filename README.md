# DÖNER DIOSA FORTUNA — Carte digitală prin QR

Aplicație web (Next.js + Supabase) care funcționează ca **meniu digital accesat prin cod QR**.
Clientul scanează codul, consultă carta, adaugă produse într-un **coș de selecție** și, când e gata,
apasă **„ARATĂ CHELNERULUI”** pentru a-i arăta ecranul cu selecția. Coșul **nu este un sistem de
comenzi**: nu există plată online, checkout sau trimitere a comenzii — chelnerul preia comanda manual.

---

## 1. Arhitectură

```
app/
  page.tsx              → carta publică (server component, citește din Supabase)
  layout.tsx             → layout rădăcină (limbă: ro, fonturi, metadata)
  admin/
    login/                → autentificare admin (Supabase Auth)
    page.tsx               → dashboard cu statistici
    produse/                → listă, creare, editare produse
    categorii/              → gestionare categorii/subcategorii
    setari/                 → date restaurant (nume, logo, descriere, program)
components/
  Header, CategoryNav, ProductList, ProductCard,
  ProductOptionsSheet, CartDrawer, WaiterScreen  → carta publică
  admin/                                          → formulare și tabele admin
lib/
  supabase/client.ts   → client Supabase pentru browser
  supabase/server.ts   → client Supabase pentru server components
  cart.ts               → coșul de selecție, persistat în localStorage
  types.ts               → tipuri TypeScript pentru toate entitățile
middleware.ts           → protejează /admin, redirect la /admin/login dacă nu ești autentificat
supabase/schema.sql     → schema completă (tabele, RLS, storage)
```

**Tehnologii:** Next.js 14 (App Router, TypeScript), Tailwind CSS, Supabase
(Postgres + Auth + Storage), găzduire pe Vercel sau Netlify (plan gratuit).

---

## 2. Configurare Supabase

1. Creează un proiect nou pe [supabase.com](https://supabase.com) (plan gratuit).
2. În **SQL Editor**, rulează integral fișierul [`supabase/schema.sql`](./supabase/schema.sql).
   Acesta creează:
   - tabelele `categories`, `subcategories`, `products`,
     `product_option_groups`, `product_option_choices`, `restaurant_settings`;
   - politicile **RLS**: citire publică (necesară pentru carta digitală) și
     scriere permisă doar utilizatorilor autentificați (admin);
   - bucket-ul de **Storage** `product-images` (public, pentru imagini produse și logo).
3. Baza de date pornește **complet goală** — fără categorii sau produse demo.
   Meniul se construiește exclusiv din `/admin`.

### Creează contul de administrator

În Supabase Studio → **Authentication → Users → Add user**, creează un utilizator
cu email și parolă. Acesta va fi contul cu care te loghezi în `/admin`.
(Autentificarea prin email/parolă este suficientă — nu este nevoie de conturi
pentru clienți, aceștia nu au niciodată acces la zona de administrare.)

---

## 3. Variabile de mediu

Copiază `.env.example` în `.env.local` și completează cu valorile din
**Supabase → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Nu adăuga niciodată chei private (`service_role`) în cod sau în repository.
Cheia `anon` este publică prin design — securitatea reală vine din politicile RLS.

---

## 4. Rulare locală

```bash
npm install
npm run dev
```

Aplicația pornește pe `http://localhost:3000`.
Panoul de administrare este la `http://localhost:3000/admin`.

---

## 5. Utilizare panou admin (`/admin`)

1. **Login** cu contul creat în Supabase Auth.
2. **Categorii** → creează categoriile (ex: MÂNCARE, BĂUTURI, CAFEA ȘI DESERTURI)
   și, opțional, subcategorii pentru fiecare (ex: Döner, Shaorma, Burger).
3. **Produse → „+ Adaugă produs”** → completează nume, descriere, ingrediente,
   preț, categorie, subcategorie, imagine, disponibilitate. Opțional, adaugă
   grupuri de opțiuni (ex: „Mărime” cu Normal/Mare, „Extra” cu suprataxe).
4. Produsul apare **imediat** în carta publică — fără redeploy.
5. **Editare preț / descriere / imagine** → salvezi → carta publică se actualizează automat.
6. **„Epuizat”** → produsul rămâne în baza de date, dar apare marcat „EPUIZAT”
   în carta publică și nu poate fi adăugat în coș. Poate fi reactivat oricând.
7. **Setări restaurant** → nume, logo, descriere (afișată sub cabecera publică),
   adresă, telefon, program.

---

## 6. Codul QR

Nu este nevoie de generator de QR în aplicație. Generează codul QR (cu orice
serviciu, ex. un generator online gratuit) care să indice direct URL-ul public
al aplicației deployate, de exemplu:

```
https://doner-diosa-fortuna.vercel.app
```

Scanarea deschide direct carta — nu există niciun ecran intermediar.

---

## 7. Deploy (gratuit)

1. Urcă proiectul pe **GitHub**.
2. Conectează repository-ul la **Vercel** (sau Netlify).
3. În setările proiectului din Vercel, adaugă variabilele de mediu
   `NEXT_PUBLIC_SUPABASE_URL` și `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. Fiecare push pe branch-ul principal redeployează automat.
5. Actualizarea produselor/prețurilor din `/admin` **nu necesită un nou deploy** —
   carta publică citește mereu live din Supabase.

---

## 8. Securitate

- **Supabase Auth** protejează `/admin` (middleware redirecționează la
  `/admin/login` dacă nu există sesiune activă).
- **Row Level Security** activat pe toate tabelele: citire publică (necesară
  pentru meniu), scriere restricționată la utilizatori autentificați.
- Storage-ul de imagini este public la citire, dar scrierea (upload/ștergere)
  este permisă doar utilizatorilor autentificați.
- Clienții nu au niciodată cont sau autentificare — carta este complet publică
  la citire, coșul este local (localStorage), fără date personale trimise nicăieri.

---

## 9. Stări ale aplicației

- **Carte goală:** „MOMENTAN NU EXISTĂ PRODUSE DISPONIBILE.”
- **Categorie fără produse:** „NU EXISTĂ PRODUSE ÎN ACEASTĂ CATEGORIE.”
- **Coș gol:** „COȘUL TĂU ESTE GOL.” + „Adaugă produse din meniu pentru a le vedea aici.”
- **Produs epuizat:** etichetă „EPUIZAT” pe imagine, buton dezactivat.

---

## 10. Ce NU face aplicația (intenționat)

- Nu procesează plăți.
- Nu trimite comenzi către bucătărie sau către Supabase.
- Nu creează conturi de client.
- Coșul este strict o listă de selecție temporară, locală pe telefon,
  care se arată chelnerului pentru ca acesta să preia comanda manual.
