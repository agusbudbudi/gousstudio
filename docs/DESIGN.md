# Gous Studio — Landing Page Revamp & Brand Design System

> Versi 1.1 · Oktober 2026 · Dokumen handoff untuk developer & designer
> Status: **diimplementasikan** di `src/components/landing/*` + `src/pages/Home.tsx` (Vite). Halaman lain masih memakai tema lama.
> Scope: revamp total landing page `/` (Home) + fondasi brand visual yang dipakai ulang di `/portfolio`, `/pricelist`, dan halaman lain.

---

## 0. Ringkasan & Catatan Kondisi Repo

### Ringkasan arah baru
**"Studio, bukan template."** Landing page baru meninggalkan gaya *neon glassmorphism + blob gradient* yang generik, dan beralih ke estetika **editorial agency**: tipografi display besar, grid tegas, karya sebagai pusat perhatian, satu warna brand (violet) yang dipakai dengan disiplin, dan satu warna aksen "spark" (oranye) untuk momen kecil. Semua jalan menuju satu aksi: **chat WhatsApp**.

### Temuan dari repository (wajib diberesin saat revamp)
| # | Temuan | Lokasi | Dampak | Aksi |
|---|---|---|---|---|
| 1 | Token `--color-brand` adalah **oranye `#ff7739`**, padahal identitas brand = violet `#8b5cf6` (`theme-color` di `index.html` sudah violet). | `src/index.css` | Identitas tidak konsisten; CTA oranye, logo/OG violet. | Ganti sistem token sesuai §2. Oranye diturunkan jadi aksen. |
| 2 | Klaim pengalaman beda: meta description "5+ tahun", hero "7+ tahun". | `index.html`, `Hero.tsx` | Merusak kredibilitas & SEO snippet. | Seragamkan **7+ tahun** di semua tempat. |
| 3 | Kontak beda: brief pakai `agdesign.official@gmail.com` / `+62 855-5949-6968`, kode pakai `gous.studio@gmail.com` / `+62 895-2403-6666`. | `src/config/constants.ts` | Lead bisa nyasar. | **Owner putuskan satu nomor & email resmi**, simpan hanya di `constants.ts`, semua komponen baca dari sana. |
| 4 | `@font-face` Neue Machina weight 400 & 900 menunjuk file yang sama (`NeueMachina-Regular.woff2`). | `src/index.css` | Bold "palsu" (faux-bold) → huruf display terlihat murah. | Tambah file `NeueMachina-Ultrabold.woff2` / `-Bold.woff2`, atau ganti font display (§2.3). |
| 5 | Dua font Google (Outfit + Plus Jakarta Sans, 7 weight Outfit) + Neue Machina. | `index.html` | Payload font berlebih, LCP lambat. | Maks 2 family, maks 4 file weight total. |
| 6 | Hero memakai efek typing (state update tiap 60–100ms). | `Hero.tsx` | Re-render terus-menerus, headline tidak terbaca utuh oleh crawler/screen reader, CLS kecil. | Ganti headline statis + rotasi kata dengan `aria-live="off"` dan teks lengkap untuk SR. |
| 7 | Semua section fetch Supabase sendiri-sendiri dengan spinner. | `Services.tsx`, `Portfolio.tsx`, dll. | Layout lompat (CLS), 6 spinner di satu halaman. | Pakai `@tanstack/react-query` (sudah terpasang) + skeleton dengan dimensi tetap. |
| 8 | Duplikat file `Testimonials.jsx` & `Testimonials.tsx`, `LazyImage.jsx` & `.tsx`. | `src/components`, `src/ui` | Bingung mana yang dipakai. | Hapus versi `.jsx` setelah verifikasi. |

### Catatan stack
Brief menyebut **Next.js + shadcn/ui**, tetapi repo saat ini **Vite 8 + React 19 + React Router 7 + Tailwind v4 + Framer Motion**, shadcn/ui belum terpasang. Dokumen ini ditulis agar berlaku untuk keduanya:
- **Opsi A (disarankan untuk revamp ini):** tetap di Vite, tambahkan shadcn/ui (mendukung Vite + Tailwind v4), dan perbaiki SEO dengan prerender halaman publik (mis. `vite-plugin-prerender` / `vite-ssg`-style) supaya konten Home terindeks tanpa JS.
- **Opsi B:** migrasi ke Next.js (App Router) — SEO & `next/image` lebih baik, tapi CMS, client portal, order & payment ikut harus dimigrasi. Jadikan project terpisah, jangan dicampur dengan revamp visual.

Tailwind tokens di §2 ditulis untuk **Tailwind v4 (`@theme`)** — sama persis di kedua opsi.

---

## Riset Referensi

Pola yang diambil dari studio/agency yang dianggap standar industri (Awwwards "Design Agencies", studio branding global & lokal):

| Referensi | Yang diambil | Yang **tidak** diambil |
|---|---|---|
| **Koto** (koto.studio) | Headline besar dan percaya diri, karya ditampilkan full-bleed, copy pendek. | Animasi 3D berat. |
| **Collins** (wearecollins.com) | Grid karya editorial, label kategori kecil di atas judul project. | Navigasi eksperimental yang membingungkan. |
| **Locomotive** (locomotive.ca) | Scroll reveal halus, marquee teks besar sebagai pemisah section. | Smooth-scroll hijack (buruk untuk aksesibilitas & mobile). |
| **basement.studio** | Kontras tinggi gelap/terang, angka & label monospace sebagai "detail studio". | Kebisingan visual berlebihan. |
| **Thinking Room** (Jakarta) | Bukti bahwa agency Indonesia bisa tampil premium dengan copy bilingual ringan. | — |

Tren 2026 yang relevan dan aman diterapkan: **bento grid** untuk layanan/keunggulan, **oversized typography**, **kinetic type ringan** (marquee), **bukti sosial di atas fold** dekat CTA, dan **CTA yang menjelaskan apa yang terjadi berikutnya** ("Chat via WhatsApp — dibalas < 24 jam" lebih kuat dari "Hubungi Kami").

Sumber: [Awwwards – Design Agencies](https://www.awwwards.com/websites/design-agencies/) · [B12 – Bento grids & kinetic typography 2026](https://www.b12.io/resource-center/website-design/web-design-guide-bento-grids-and-kinetic-typography/) · [Line25 – Web Design Trends 2026](https://line25.com/articles/web-design-trends-2026/) · [StudioMeyer – Trends 2026 reality check](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check) · [involve.me – Landing page best practices](https://www.involve.me/blog/landing-page-best-practices) · [ProveSource – Social proof on landing pages](https://provesrc.com/blog/social-proof-landing-pages-best-practices/) · [CorePPC – Above the fold](https://coreppc.com/cro/landing-page-above-fold/)

---

## 1. Analisis Kelemahan Landing Page Lama

### Struktur
- **Urutan tidak mengikuti alur keputusan klien.** Services dan Process muncul *sebelum* karya. Untuk studio desain, karya adalah produknya — pengunjung ingin melihat hasil dulu, baru percaya pada proses.
- **Dua section penawaran terpisah** (Special Offers + Flexible Pricing) dan Fastwork di tengah halaman memecah fokus; Fastwork bahkan mengarahkan pengunjung *keluar* sebelum mereka sampai ke CTA utama.
- **About terlalu di bawah** dan generik. Faktor pembeda terbesar (founder langsung yang mengerjakan, 7+ tahun) tersembunyi.
- **Contact & CTA akhir terpisah** dari footer dan diulang dua kali — redundan.
- **Tidak ada FAQ.** Keberatan umum UMKM (berapa revisi, berapa lama, bayar bagaimana, dapat file apa) tidak dijawab → pengunjung ragu lalu pergi.

### Hierarki visual
- Headline "Creative *[typing]*" tidak menyebut **siapa yang dibantu** dan **hasil apa yang didapat**. Kata yang berganti-ganti juga membuat pesan tidak pernah terbaca utuh.
- Terlalu banyak efek bersaing: 3 blob gradient, glassmorphism, neon border, glow, gradient text, animasi bounce. Tidak ada satu titik fokus.
- Warna brand tidak konsisten (oranye vs violet vs pink vs 8 warna per kartu service) → tidak ada "warna Gous" yang diingat.
- Judul section bahasa Inggris generik ("What We Offer") bercampur copy Indonesia — terasa template.

### Konversi
- **CTA utama ganda dan ambigu:** "Lihat Portfolio" (primer) vs "Order Sekarang" (sekunder, membuka modal). WhatsApp — saluran paling efektif untuk target UMKM — tidak muncul di hero.
- **Bukti sosial terlambat:** logo klien baru di section 2 tanpa konteks, testimoni di section 9 dan tanpa foto/hasil terukur.
- **Harga baru terlihat jauh di bawah.** Target UMKM sangat sensitif harga; "mulai dari Rp…" harus muncul lebih awal untuk mengurangi rasa takut mahal.
- **Tidak ada pengurang risiko** yang eksplisit (garansi revisi, DP, file lengkap, respon < 24 jam) di dekat CTA.
- **Mobile:** tidak ada CTA yang selalu terlihat; tombol WhatsApp melayang menutupi konten.

---

## 2. Arah Visual Baru

### 2.1 Mood
**"Editorial · Confident · Crafted."**
Rasa seperti membuka *lookbook* studio: banyak ruang kosong, huruf display besar, karya tampil besar, detail kecil ala studio (nomor section `01/`, label monospace, garis grid tipis). Violet muncul sebagai *signature*, bukan sebagai gradient di mana-mana.

Kata kunci moodboard: `editorial grid`, `oversized type`, `ink & paper`, `violet signature`, `sticker accent`, `quiet motion`.

Hindari: blob gradient, glassmorphism berlapis, neon glow, emoji dekoratif, 3D mockup stok.

### 2.2 Palet warna (turunan `#8b5cf6`)
Mode **default = terang ("paper")** untuk kesan premium & keterbacaan; section tertentu (Hero alternatif, Process, CTA akhir, Footer) memakai **"ink"** gelap sebagai ritme. Dark mode global tetap didukung via token.

| Token | Hex | Peran |
|---|---|---|
| `violet-50` | `#f5f3ff` | Background tint kartu/badge |
| `violet-100` | `#ede9fe` | Hover tint, chip filter |
| `violet-200` | `#ddd6fe` | Border aktif lembut |
| `violet-300` | `#c4b5fd` | Teks aksen di atas ink |
| `violet-400` | `#a78bfa` | Link/ikon di atas ink |
| **`violet-500`** | **`#8b5cf6`** | **Signature brand** — elemen grafis, highlight, ilustrasi, teks besar ≥ 24px |
| `violet-600` | `#7c3aed` | **Tombol primer** (teks putih, kontras 5.7:1 ✅ AA) |
| `violet-700` | `#6d28d9` | Hover tombol primer |
| `violet-900` | `#4c1d95` | Teks aksen di atas paper |
| `violet-950` | `#2e1065` | Section "deep violet" (CTA akhir) |
| `ink` | `#0b0a12` | Teks utama & section gelap (sedikit violet, bukan hitam murni) |
| `ink-800` | `#1a1825` | Kartu di section gelap |
| `paper` | `#f7f6f2` | Background utama (off-white hangat) |
| `paper-200` | `#ecebe6` | Background alternatif section |
| `line` | `#0b0a12` @ 10% | Garis grid & border |
| `muted` | `#5b5966` | Teks sekunder di paper (kontras 6.6:1 ✅) |
| `spark` | `#ff7739` | **Aksen** (warisan oranye lama): stiker "Promo", dot status, highlight kecil. Maks ±5% permukaan. Teks di atasnya = `ink`. |
| `success` | `#22c55e` | Dot "Available", WhatsApp-related |

**Aturan kontras (WCAG AA):**
- `#8b5cf6` + teks putih = **4.2:1 → gagal** untuk teks normal. Jangan pakai untuk tombol berteks kecil; pakai `violet-600`.
- `#8b5cf6` di atas `paper` hanya untuk teks ≥ 24px atau elemen grafis.
- Di atas `ink`: `violet-400` (7.3:1) untuk teks, `violet-500` (4.7:1) boleh.

**Tailwind v4 token (`src/index.css`):**
```css
@theme {
  --color-violet-50:  #f5f3ff;
  --color-violet-100: #ede9fe;
  --color-violet-200: #ddd6fe;
  --color-violet-300: #c4b5fd;
  --color-violet-400: #a78bfa;
  --color-violet-500: #8b5cf6;
  --color-violet-600: #7c3aed;
  --color-violet-700: #6d28d9;
  --color-violet-900: #4c1d95;
  --color-violet-950: #2e1065;

  --color-ink: #0b0a12;
  --color-ink-800: #1a1825;
  --color-paper: #f7f6f2;
  --color-paper-200: #ecebe6;
  --color-muted: #5b5966;
  --color-spark: #ff7739;

  --font-display: "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-label: "Neue Machina", ui-monospace, monospace;

  --radius-card: 1.25rem;
  --radius-pill: 999px;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Semantic aliases — komponen pakai ini, bukan hex mentah */
:root {
  --bg: var(--color-paper);
  --fg: var(--color-ink);
  --fg-muted: var(--color-muted);
  --surface: #ffffff;
  --border: rgb(11 10 18 / 0.10);
  --accent: var(--color-violet-600);
}
.dark {
  --bg: var(--color-ink);
  --fg: #f4f3f8;
  --fg-muted: #a09eb0;
  --surface: var(--color-ink-800);
  --border: rgb(255 255 255 / 0.08);
  --accent: var(--color-violet-400);
}
```
Hapus: `--color-brand` oranye, `--color-neon-*`, `--color-glass-*`, kelas `.blob`, `.neon-border`, `.neon-glow`, `.text-gradient`. Satu-satunya gradient yang diizinkan: `violet-500 → violet-700` pada elemen grafis besar (misal kartu "Custom").

### 2.3 Tipografi
| Peran | Font | Weight | Ukuran (mobile → desktop) | Catatan |
|---|---|---|---|---|
| Display / H1 | **Bricolage Grotesque** (Google Fonts, variable `opsz`) | 800 | Hero landing: `clamp(2.625rem, 6.4vw, 6rem)` (maks 96px), **2 baris** di ≥ md (`whitespace-nowrap` per baris); H1 halaman dalam tetap `clamp(2.75rem, 8vw, 6.25rem)` — leading 0.95, tracking -0.035em | *Diimplementasikan.* Neue Machina bold tidak tersedia (file `NeueMachina-Ultrabold.woff2` di repo ternyata HTML rusak). |
| H2 section | Bricolage Grotesque | 800 | `clamp(2.25rem, 5.5vw, 4.25rem)`, leading 0.95 | |
| H3 kartu | Plus Jakarta Sans | 700 | 20 → 24px | |
| Body | **Plus Jakarta Sans** (tipografi karya desainer Indonesia — cerita bagus untuk brand lokal) | 400/500 | 16 → 18px, leading 1.6 | Ganti Outfit. |
| Label/eyebrow | **Neue Machina Regular** (self-host, sudah ada) | 400 | 12px, uppercase, tracking 0.08em | Untuk `01 — Services`, kategori, stiker. |

Aturan: maks 2 family + 1 mono opsional; self-host `woff2` di `/public/fonts`, `font-display: swap`, `preload` hanya font display & body regular. Panjang baris body maks `65ch`.

### 2.4 Grid & spacing
- **Mobile first:** 4 kolom, gutter 16px, margin samping 20px.
- **Tablet (≥768px):** 8 kolom, gutter 20px, margin 32px.
- **Desktop (≥1280px):** 12 kolom, gutter 24px, container maks **1320px**, margin 48px.
- Ritme vertikal section: `py-20` mobile → `py-32` desktop. Skala spacing 4/8/12/16/24/32/48/64/96/128.
- **Spacing header halaman** (jarak dari atas viewport, sudah termasuk navbar fixed `h-16`/`md:h-20`):

  | Jenis | Padding | Isi sebelum H1 | Dipakai di |
  |---|---|---|---|
  | Hero landing | `pt-28 pb-16` → `md:pt-40 md:pb-24` | Pill status → `mt-7`/`md:mt-9` | `/` |
  | Header halaman dalam (compact) | `pt-24 pb-10` → `md:pt-32 md:pb-12` | Link "← Beranda" → `mt-6` → eyebrow → `mt-5` | `/portfolio`, nanti `/pricelist` dsb. |

  Halaman dalam sengaja lebih rapat dari landing: link kembali + eyebrow sudah menambah tinggi, jadi H1 tetap jatuh di posisi visual yang sama dengan landing dan konten (filter/grid) cepat terlihat tanpa scroll.
- **Sticky sub-nav** (filter, tab) memakai class `.gs-subnav`: menempel tepat di bawah navbar (`top: 4rem` / `md: 5rem`) dan naik ke `top: 0` saat navbar bersembunyi (atribut `html[data-gs-nav-hidden]`, transisi 0.35s easing expo — sama dengan navbar).
- Setiap section punya **header bergaya editorial**: eyebrow mono `01 — Selected Work` di kiri, H2 besar, lalu 1 kalimat penjelas + link di kanan (desktop) / di bawah (mobile).
- Garis tipis `border-t border-[--border]` di atas setiap section → kesan "lembar majalah".
- Radius: kartu 20px, tombol pill. Tanpa shadow berat — elevasi dengan border + perubahan background saat hover.

### 2.5 Gaya tampilan portofolio
- **Masonry sesuai rasio asli** (CSS `columns`): gambar **tidak di-crop** — poster portrait, feed square, banner landscape tampil apa adanya, jadi karya terlihat utuh dan rapi. Landing (Selected Work) dan `/portfolio` sama: `columns-1 sm:columns-2 md:columns-3 lg:columns-4` (1 → 2 → 3 → 4 kolom), gap 20px; landing maks 12 karya (§2.6 untuk halaman portfolio).
- Anti layout-shift: placeholder 4:5 (`WorkImage`) sampai gambar termuat, lalu fade-in di tinggi aslinya; skeleton loading memakai tinggi bervariasi.
- Di bawah gambar (bukan overlay): label kategori mono kecil + nama klien + 1 baris hasil (mis. "Logo & brand guideline · 2025").
- Hover desktop: gambar `scale(1.03)`, kursor custom bulat "Lihat" (opsional), judul bergeser 4px. Mobile: tanpa hover, tap → lightbox/detail.
- Background kartu `paper-200`; karya ditaruh di mockup sederhana yang konsisten (lihat §9) — **konsistensi mockup = kesan agency**.

---

### 2.6 Halaman `/portfolio`
Implementasi: [src/pages/PortfolioPage.tsx](../src/pages/PortfolioPage.tsx). Memakai shell yang sama dengan landing (navbar, footer, sticky CTA, Final CTA).

1. **Header compact** — link "← Beranda", eyebrow `01 — Portfolio`, H1 "Karya yang *bicara* sendiri." (`clamp(2.75rem, 8vw, 6.25rem)`), deskripsi + jumlah karya/kategori di kolom kanan. Spacing: lihat tabel "Spacing header halaman" di §2.4.
2. **Sticky filter bar** (`.gs-subnav`) — pill kategori dengan jumlah item (`layoutId` pill meluncur), kolom cari (judul/deskripsi/tag), baris tag sekunder saat satu kategori dipilih. State filter disimpan di URL: `?cat=poster&tag=Banner` (bisa dibagikan; state lama `{ activeTab }` tetap didukung).
3. **Grid masonry** — `columns-1 sm:columns-2 md:columns-3 lg:columns-4` (1 → 2 → 3 → 4 kolom), gap 20px; caption di bawah gambar (judul + label kategori mono + maks 3 tag). Gambar memakai `WorkImage`: placeholder berukuran tetap → fade-in, fallback tipografis bila gagal.
4. **Muat lebih banyak** — 24 item per batch, plus teks "Menampilkan X dari Y karya" (menggantikan pagination bernomor).
5. **State** — skeleton masonry saat loading; empty state "Belum ketemu." + reset filter; error state + "Coba lagi" & WA "Minta contoh karya".
6. **Final CTA** + footer.

SEO: title `Portfolio Desain Logo, Poster & Social Media | Gous Studio`, canonical `/portfolio`, JSON-LD `ItemList` (maks 50 item).

### 2.7 Halaman `/pricelist`
Implementasi: [src/pages/PricelistPage.tsx](../src/pages/PricelistPage.tsx). Shell sama dengan landing.

1. **Header compact** (spacing §2.4) — "← Beranda", eyebrow `01 — Pricelist`, H1 "Harga jelas, kualitas *studio.*", deskripsi + ringkasan "N paket · mulai Rp X" (harga terendah dihitung otomatis).
2. **Sticky filter bar** (`.gs-subnav`) — pill kategori (urutan mengikuti CMS) dengan jumlah paket + cari (nama, deskripsi, kategori, deliverables). State di URL: `?cat=Social%20Media`.
3. **Daftar paket**
   - Tanpa filter/pencarian → **dikelompokkan per kategori**: judul kategori display besar + label `01 · 8 paket`, lalu grid.
   - Dengan filter/pencarian → satu grid datar.
   - Grid `sm:2 → lg:3` kolom (bukan 4: harga 40px + deliverables butuh lebar ±340px).
4. **Kartu paket** (`PackageCard`, dipakai juga di landing §Paket Hemat): kategori (label violet), nama, deskripsi 2 baris, harga coret + harga final, durasi & revisi, maks 6 deliverables + "+N lainnya", CTA utama **"Pilih paket ini"** (WhatsApp prefilled nama + harga), sekunder "Isi form order" (modal order) · "Detail →" (`/pricelist/:slug`).
   - Badge (stiker miring): **Best Value** (violet, border 2px violet) bila nama paket di CMS mengandung "BEST VALUE" — teks & emoji itu otomatis dibuang dari judul; selain itu **Hemat X%** (spark) bila ada harga coret; **Rekomendasi** hanya untuk kartu yang di-highlight di landing.
5. Trust row (QRIS/transfer/e-wallet · revisi · file final), banner **Custom Project**, **FAQ** (eyebrow `02`), Final CTA, footer.
6. **State** — skeleton kartu; error + "Coba lagi" & WA "Minta pricelist"; empty "Paket belum ketemu." + reset & WA "Tanya paket custom".

SEO: title `Harga Jasa Desain Logo, Branding & Social Media | Gous Studio`, canonical `/pricelist`, JSON-LD `OfferCatalog` (Offer per paket, IDR).

Catatan CMS: tulis nama paket tanpa emoji/label promosi (mis. "Poster – Paket Pro"); label "Best Value" sebaiknya jadi field boolean terpisah di tabel `pricelists` (saat ini masih dideteksi dari nama).

### 2.8 Halaman detail paket `/pricelist/:slug`
Implementasi: [src/pages/PricelistDetailPage.tsx](../src/pages/PricelistDetailPage.tsx), data via `usePackageDetail(slug)` (cari by `slug`, fallback by `servicename`).

1. **Header** (spacing compact §2.4) — breadcrumb `← Pricelist › Kategori › Nama paket`; grid 12 kolom:
   - Kiri (7): eyebrow kategori + badge Best Value, H1 nama paket (`clamp(2.5rem, 6.5vw, 5rem)`, nama sudah dibersihkan dari label promo), deskripsi, **"Yang kamu dapat"** (semua deliverables, 2 kolom), lalu **Gous Guarantee** (kartu violet-50, ikon perisai `/img/guarantee-icon.png`, 4 jaminan: Original Design · On-Time · High Quality · Expert Support — grid 2 kolom, 4 kolom di `xl`). Ditaruh di kolom kiri agar area di bawah deliverables tidak kosong dan kolom kanan tetap ringkas. Implementasi: grid 12 kolom, aside `lg:row-span-2 lg:self-stretch` (agar sticky punya ruang), Guarantee jadi item ke-3 → urutan mobile: detail → kartu order → Guarantee (CTA tidak terdorong ke bawah).
   - Kanan (5, sticky `top-28` di desktop): **kartu order** — harga coret + final + stiker Hemat X%, durasi & revisi (2 sel), CTA **"Pesan via WhatsApp"** (prefilled nama + harga), "Isi form order", microcopy respon < 24 jam, trust points; di bawahnya link "Minta versi custom".
2. **Contoh hasil** — karya yang terhubung (`portfolios.pricelist_id`); bila kosong, fallback **"Karya serupa"** dari kategori portfolio yang cocok (mapping keyword `PACKAGE_WORK_KEYWORDS`). Grid rapi rasio 4:5 (2 kolom mobile, 3/4 kolom desktop tergantung jumlah) — bukan masonry, karena jumlah item sedikit.
3. **Cara order** (section ink) — 5 langkah: Briefing → Pembayaran DP 50% → Desain → Revisi → Serah terima.
4. **Bandingkan** — maks 3 paket lain di kategori yang sama (`PackageCard`).
5. **FAQ paket** — jawaban dinamis dari data paket (durasi, revisi), + pembayaran & orisinalitas.
6. Banner Custom Project → Final CTA → footer.
7. **State** — skeleton 2 kolom; "Paket tidak ditemukan." (link ke pricelist) / "Paket gagal dimuat." (coba lagi) + WA.

SEO: title `{Nama paket} — Rp X | Gous Studio`, description dari deskripsi paket, canonical per slug, JSON-LD `Service` + `Offer` (IDR).

Dipertahankan dari versi lama: section **Gous Guarantee** (wajib ada). Dihapus: klaim "Trusted by 500+ Clients" dan rating "4.9" (tidak terverifikasi, bertentangan dengan angka 100+ klien).

### 2.9 Modal form order
Implementasi: [src/ui/OrderModal.tsx](../src/ui/OrderModal.tsx) — dibuka lewat `openOrderModal(pkg?)` (kartu paket, halaman detail, Final CTA). Tanpa komponen CMS; input sendiri dengan token brand.

- **Wadah** — **side sheet (drawer) dari kanan, tinggi penuh** (`h-[100dvh]`), panel **putih** (`.gs gs-white`), lebar `max-w-[560px]` (≥ sm) dengan border kiri + bayangan ke kiri; mobile (< sm) lebar penuh layar. Overlay `ink/55` + blur di sisa layar. Animasi masuk/keluar geser `x: 100% → 0`, 0.45s easing expo (fade saja bila reduced motion). Header & footer tombol menempel, isi form ber-scroll di tengah; safe-area atas/bawah dihormati. `role="dialog"`, `aria-modal`, Esc menutup, scroll halaman dikunci. Klik overlay hanya menutup bila form belum diisi (mencegah data hilang).
- **Header** — eyebrow `Form order`, judul display "Ceritakan project-mu.", tombol tutup bulat.
- **Kebutuhan desain** — **combobox custom** ([src/ui/PackageCombobox.tsx](../src/ui/PackageCombobox.tsx)): input dengan ikon cari, bisa diketik untuk memfilter (nama/kategori), dropdown putih ber-shadow maks 300px, opsi dikelompokkan per kategori (header label mono) dengan "Custom Package" di grup "Lainnya" paling atas; tiap opsi: nama paket (label promo dibersihkan) + "Rp X · N hari", opsi terpilih violet + ikon cek, opsi aktif ber-latar violet-50. Keyboard: ↑/↓, Enter memilih, Esc menutup list saja (bukan modal), Tab keluar. ARIA: `role="combobox"` + `listbox`/`option` + `aria-activedescendant`. Di bawah input tampil ringkasan paket terpilih (harga · durasi · kategori). Memilih paket mengisi otomatis kategori, deadline (hari ini + durasi), dan template brief.
- **Field** — Nama + WhatsApp (2 kolom ≥ sm; WA `inputMode=numeric`, hanya angka), Detail brief (textarea + hint isi brief; template "Paket / Yang termasuk / Catatan tambahan"), Tanggal dibutuhkan (`min` = besok, hint bila diisi otomatis), Kode voucher disembunyikan di balik link "+ Punya kode voucher?". Label di atas input, error inline merah + `aria-invalid`/`aria-describedby`; fokus otomatis ke Nama.
- **Footer sticky** — tombol penuh "Kirim order via WhatsApp" (spinner "Menyimpan order…"), microcopy "Order tersimpan dulu, lalu WhatsApp terbuka untuk konfirmasi."
- **Error submit** — banner inline (bukan `alert()`).
- **Sukses** — ikon cek violet, "Terima kasih.", nomor order (mono) + paket, tombol "Lacak pesanan" (`/order/:no`), "WhatsApp belum terbuka? Buka lagi" (fallback bila pop-up diblokir browser), "Selesai".
- Data paket di-fetch hanya saat modal dibuka (`usePackages(isOpen)`, cache dibagi dengan halaman lain). Logika simpan order (`/api/orders?action=create`) & nomor WA order (`CONFIG.WA_NUMBER`) tidak berubah.

### 2.10 Scrollbar
Implementasi: blok `SCROLLBAR` di [src/index.css](../src/index.css). App memasang atribut `html[data-gs-shell]` saat halaman ber-shell baru aktif (`/`, `/portfolio`, `/pricelist`, `/pricelist/:slug`).

| Konteks | Track | Thumb | Hover |
|---|---|---|---|
| Halaman shell baru (scrollbar halaman) | paper `#f7f6f2` | ink 22% `rgb(11 10 18 / .22)` | violet-600 `#7c3aed` |
| Area scroll di dalam `.gs` (modal, dropdown combobox) | transparan | ink 22% | violet-600 |
| Halaman lama bertema gelap (order, payment, portal) | `--color-bg` | violet-400 45% | violet-400 |
| CMS (`.custom-scrollbar`) | transparan | putih 8% | violet-400 |

- Bentuk: area 10px, thumb tampak 4px (border transparan 3px + `background-clip: padding-box`), radius penuh. Strip horizontal (filter, carousel) tetap `scrollbar-hide`.
- Firefox: `scrollbar-width: thin` + `scrollbar-color` (hanya di `@supports (-moz-appearance: none)` — di Chromium properti standar akan mematikan styling `::-webkit-scrollbar`).
- Catatan teknis: karena `body { overflow-x: hidden }`, scrollbar viewport diambil dari `body`; nilai warna ditulis eksplisit (bukan `var()`) karena Chromium tidak me-restyle scrollbar root saat custom property berubah. Shell baru juga men-set latar `html`/`body` ke paper agar area overscroll/bounce tidak gelap.

### 2.11 Full preview karya (lightbox)
Implementasi: [src/ui/Lightbox.tsx](../src/ui/Lightbox.tsx) — dipakai di Selected Work (landing), `/portfolio`, dan contoh karya di detail paket.

- **Latar** ink 97% + blur (gelap agar karya menonjol), full-screen, `z-[120]` (di atas navbar & sticky CTA). `role="dialog"`, `aria-modal`, scroll halaman dikunci, fokus ke tombol tutup saat dibuka dan dikembalikan saat ditutup.
- **Top bar** — penghitung mono `03 / 24` (kiri, `aria-live`), tombol tutup bulat (kanan).
- **Stage** — gambar `object-contain` sesuai rasio asli, radius 16px, maks lebar 6xl; spinner saat memuat lalu fade-in; fallback tipografis bila gagal; embed Canva tetap didukung (16:9). Klik area kosong di sekitar gambar menutup (wrapper gambar seukuran gambar, bukan selebar stage).
- **Navigasi** — desktop: tombol bulat kiri/kanan (`paper/10`, hover jadi paper solid); mobile: **swipe** kiri/kanan (drag Framer, ambang 60px/velocity) + tombol di bar bawah; keyboard ←/→/Esc. Transisi geser 60px + fade sesuai arah (fade saja bila reduced motion). Gambar sebelum/sesudah di-preload.
- **Bar bawah** — kategori (label violet-300), judul, deskripsi 2 baris, maks 5 tag (≥ sm), dan CTA konversi **"Mau desain seperti ini"** (WhatsApp prefilled judul karya, varian terang).
- CSS lama `#lightbox` dihapus — komponen baru tidak memakai ID global.

## 3. Struktur Section Baru (urutan konversi)

Prinsip urutan: **Janji → Bukti → Penawaran → Cara kerja → Pengurang risiko → Aksi.** Bukti sosial muncul di 3 titik awal (hero, marquee, karya) sebelum pengunjung melihat harga.

| # | Section | Tujuan | CTA di section |
|---|---|---|---|
| 0 | **Navbar** (sticky) | Navigasi cepat + CTA WhatsApp selalu terlihat | "Chat WhatsApp" |
| 1 | **Hero** | Menjawab dalam 5 detik: siapa, untuk siapa, hasil apa; bukti ringkas | Primer WA, sekunder "Lihat Karya" |
| 2 | **Client Marquee** | Validasi instan: "brand nyata sudah percaya" | — |
| 3 | **Selected Work** (Portfolio + filter) | Bukti kualitas — produk utama studio | "Lihat Semua Karya" |
| 4 | **Services** (bento 5 layanan) | Pengunjung menemukan layanan yang dia butuhkan + harga mulai | Per kartu: "Tanya Layanan Ini" (WA prefilled) |
| 5 | **Why Gous + Angka** | Diferensiasi vs freelancer acak/agency mahal | — |
| 6 | **Testimoni** | Bukti dari sesama UMKM, dengan hasil | — |
| 7 | **Process** (4 langkah) | Mengurangi ketidakpastian: "apa yang terjadi setelah saya chat?" | — |
| 8 | **Paket Hemat** (pricing) | Titik masuk berharga terjangkau | Per paket: "Pilih Paket" (WA prefilled) |
| 9 | **Custom Project** (banner) | Menangkap kebutuhan di luar paket / retainer | "Diskusi Paket Custom" |
| 10 | **About / Founder** | Wajah manusia di balik studio → trust | "Kenalan via WhatsApp" |
| 11 | **FAQ** *(baru)* | Menjawab keberatan + SEO (FAQ schema) | — |
| 12 | **Fastwork** (strip ringkas) | Opsi alternatif bagi yang butuh escrow/rating platform | "Order via Fastwork" |
| 13 | **Final CTA + Kontak** (digabung) | Penutup emosional + info kontak lengkap | Primer WA, sekunder Order Form |
| 14 | **Footer** | Navigasi, SEO internal link, legal | — |
| — | **Sticky mobile CTA bar** + floating WA (desktop) | CTA selalu dalam jangkauan jempol | "Chat WhatsApp" |

**Kenapa Fastwork dipindah ke bawah:** link keluar sebelum CTA utama = kebocoran lead. Di bawah FAQ, Fastwork menangkap pengunjung yang *sudah hampir* pergi karena butuh jaminan platform.

**Format link WhatsApp (prefilled per konteks):**
```
https://wa.me/<WA_NUMBER>?text=Halo%20Gous%20Studio%2C%20saya%20tertarik%20dengan%20<layanan/paket>.%20Boleh%20minta%20info%3F
```
Tambahkan `utm`-like konteks di teks (mis. `[hero]`, `[paket-logo-basic]`) agar owner tahu sumber lead, dan kirim event analytics `wa_click` dengan `section` & `item`.

---

## 4. Copywriting Baru

Gaya bahasa: **"kamu"**, hangat, percaya diri, ringkas. Istilah Inggris hanya untuk istilah desain umum (brand identity, feed, logo, deliverables). Hindari "kami siap membantu", "solusi terbaik", "berkualitas tinggi" (klise).

### 0. Navbar
- Menu: **Karya · Layanan · Harga · Proses · Tentang · FAQ**
- Tombol: **Chat WhatsApp** (ikon WA)
- Logo: `GousStudio`

### 1. Hero
**Eyebrow:** `● Available — slot project Oktober terbuka` *(bulan diisi dinamis / dari CMS)*

**Headline terpilih (implementasi, 2 baris):** "Bikin brand kamu *diingat,* / bukan cuma dilihat."

**Headline — 3 alternatif awal:**
1. **"Desain yang bikin brand kamu diingat, bukan cuma dilihat."** *(rekomendasi — jelas manfaat, emosional, cocok UMKM)*
2. **"Brand identity yang kerja keras untuk bisnismu."**
3. **"Dari logo sampai feed Instagram — satu studio, satu visi."**

**Subheadline:**
> Jasa desain grafis untuk UMKM & personal brand — logo, branding, social media, dan poster yang dirancang dengan strategi. **7+ tahun, 200+ project.**
>
> *(Versi pendek yang dipakai di implementasi; "dikerjakan langsung oleh desainer senior" dipindah ke section Why Gous.)*

**CTA:**
- Primer: **Konsultasi Gratis via WhatsApp** → microcopy di bawah: *"Dibalas < 24 jam · Tanpa komitmen"*
- Sekunder: **Lihat Karya Kami ↓**

**Mini social proof (di bawah CTA):** tumpukan 4 avatar/logo klien + *"Dipercaya 100+ brand di Indonesia"* + ★ 4.9 (rating Fastwork, jika tersedia — **jangan cantumkan angka rating yang belum terverifikasi**).

### 2. Client Marquee
- Label: **"Brand yang sudah tumbuh bersama Gous"**
- Logo: Babygear · Katzenesia · My Indo Kitchen · HD Travel · Speakgurus · Gajatech · Republik Cikicow · LB Glow · Lakuna Korean · Bekasi Cat House · Annise Herbal

### 3. Selected Work
- Eyebrow: `01 — Selected Work`
- H2: **"Karya yang bicara lebih keras dari kata-kata."**
- Deskripsi: *"Pilihan project terbaru — dari identitas brand lengkap sampai poster event."*
- Filter: **Semua · Logo · Branding · Social Media · Poster**
- Link: **Lihat Semua Karya →**

### 4. Services
- Eyebrow: `02 — Services`
- H2: **"Semua yang brand kamu butuhkan untuk tampil serius."**

| Layanan | Deskripsi kartu (≤ 20 kata) | Deliverables ringkas | Harga |
|---|---|---|---|
| **Brand Identity Design** | Sistem visual utuh — logo, warna, tipografi, sampai panduan — agar brand konsisten di semua tempat. | Logo suite · Palet & font · Brand guideline · Mockup | Mulai Rp [___] |
| **Logo Design** | Logo yang simpel, unik, dan tetap tajam dari stiker kemasan sampai billboard. | 3 konsep awal · File AI/PNG/SVG · Variasi warna | Mulai Rp [___] |
| **Social Media Design** | Feed Instagram yang rapi, on-brand, dan bikin orang berhenti scroll. | Template feed & story · Konten bulanan · Highlight cover | Mulai Rp [___] |
| **Poster Design** | Poster event & promo yang artistik tapi informasinya tetap jelas dibaca. | Poster cetak/digital · Adaptasi ukuran feed/story | Mulai Rp [___] |
| **Digital Marketing Design** | Materi iklan & kampanye — banner ads, katalog, dan aset marketplace yang mendorong klik. | Banner ads · Katalog · Aset e-commerce | Mulai Rp [___] |

CTA per kartu: **Tanya Layanan Ini →**

### 5. Why Gous
- Eyebrow: `03 — Kenapa Gous`
- H2: **"Kualitas agency, kedekatan freelancer."**
- 4 poin:
  1. **Dikerjakan langsung desainer senior** — bukan dilempar ke junior. Kamu ngobrol langsung dengan orang yang mendesain.
  2. **Strategi dulu, baru estetika** — setiap desain berangkat dari riset audiens dan kompetitor.
  3. **Proses transparan** — progres bisa dipantau, revisi jelas, timeline disepakati di awal.
  4. **File lengkap, siap pakai** — semua format master & turunan, plus panduan penggunaan.
- Angka (count-up): **100+** Klien · **200+** Project · **7+** Tahun · **< 24 jam** Waktu respon

### 6. Testimoni
- Eyebrow: `04 — Kata Klien`
- H2: **"Mereka sudah merasakan bedanya."**
- Kutipan (dirapikan — **minta persetujuan klien atas teks final**):
  - **Budi Santoso, Owner Katzenesia** — *"Logonya benar-benar merepresentasikan Katzenesia. Prosesnya cepat, komunikatif, dan hasilnya melebihi ekspektasi."*
  - **Sari Putri, Marketing SpeakGuru** — *"Sejak feed Instagram kami dirapikan Gous Studio, tampilannya jauh lebih profesional dan engagement naik signifikan."* *(jika ada angka nyata, tulis: "naik 2× dalam 3 bulan")*
  - **Andi Wijaya, Event Manager Lakuna** — *"Posternya artistik tapi informasinya tetap mudah dibaca. Klien kami sangat puas."*

### 7. Process
- Eyebrow: `05 — Cara Kerja`
- H2: **"Dari brief sampai file final, tanpa drama."**
- Langkah:
  1. **Research** — *Kami pelajari bisnismu, target audiens, dan kompetitor untuk menemukan apa yang membuat brand kamu berbeda.*
  2. **Concepting** — *Ide dieksplorasi jadi beberapa arah konsep. Kamu pilih yang paling mewakili visi brand.*
  3. **Refinement** — *Konsep terpilih dipoles detail demi detail, dengan revisi terarah sampai benar-benar pas.*
  4. **Delivery** — *File final lengkap dalam semua format yang kamu butuhkan, plus panduan agar brand tetap konsisten.*
- Microcopy bawah: *"Rata-rata project logo selesai dalam [__] hari kerja."* *(isi dari data riil)*

### 8. Paket Hemat
- Eyebrow: `06 — Paket Hemat`
- H2: **"Mulai branding tanpa bikin kantong bolong."**
- Deskripsi: *"Paket ringkas dengan kualitas studio, dirancang khusus untuk UMKM dan personal brand yang baru mulai."*
- 3 kartu placeholder (data dari tabel `pricelists`):
  - **Starter Logo** — Rp [___] · ~~Rp [___]~~ · [__] hari · [__]× revisi · deliverables
  - **Brand Kit UMKM** *(badge spark "Rekomendasi" — pakai "Paling Laris" hanya jika didukung data penjualan)* — Rp [___] · logo + palet + 3 template feed
  - **Social Media Bulanan** — Rp [___]/bulan · [__] konten
- CTA kartu: **Pilih Paket Ini**
- Link: **Lihat Semua Harga →**
- Trust row: *"✓ DP 50% · ✓ Revisi sesuai paket · ✓ Pembayaran QRIS / transfer / e-wallet"*

### 9. Custom Project
- H3: **"Kebutuhanmu nggak ada di paket?"**
- Teks: *"Kami bisa susun penawaran khusus untuk project spesifik atau kerja sama jangka panjang — disesuaikan dengan budget dan target bisnismu."*
- CTA: **Diskusi Paket Custom** · microcopy *"Respon cepat via WhatsApp"*

### 10. About / Founder
- Eyebrow: `07 — Tentang`
- H2: **"Studio kecil, standar besar."**
- Teks:
  > Gous Studio didirikan oleh **Agus Budiman** pada 2019, setelah bertahun-tahun mendesain untuk brand dari berbagai industri. Kami percaya desain yang baik bukan sekadar enak dilihat — ia harus bekerja: membuat brand mudah dikenali, dipercaya, dan dipilih.
  >
  > Karena itu setiap project dikerjakan dengan perhatian penuh, dari riset sampai file terakhir. Kami sengaja menjaga studio tetap ramping agar kamu selalu berbicara langsung dengan desainernya — tanpa perantara, tanpa salah tangkap brief.
- Fakta: `Est. 2019` · `Jakarta, Indonesia` · `Adobe CC · Figma · Canva Pro` · `Logo · Branding · UI/UX · Illustration`
- Tanda tangan: *"— Agus Budiman, Founder & Creative Director"*
- CTA: **Kenalan via WhatsApp**

### 11. FAQ (baru)
- H2: **"Pertanyaan yang sering muncul"**
1. *Berapa lama pengerjaan desain logo?* → [__] hari kerja untuk paket standar; express tersedia.
2. *Berapa kali revisi yang saya dapat?* → Sesuai paket; detail tertera di setiap kartu harga.
3. *Bagaimana sistem pembayarannya?* → DP 50% di awal, pelunasan sebelum file final. QRIS, transfer bank, e-wallet.
4. *File apa saja yang saya terima?* → AI, PDF, SVG, PNG transparan, JPG + panduan penggunaan.
5. *Apakah bisa untuk klien di luar Jakarta?* → Bisa, seluruh proses online.
6. *Apakah hak cipta desain jadi milik saya?* → Ya, setelah pelunasan, hak penggunaan penuh dialihkan ke klien.

*(Jawaban final wajib dikonfirmasi owner.)*

### 12. Fastwork
- Teks: **"Lebih nyaman order lewat platform?"** *Gous Studio juga tersedia di Fastwork — lengkap dengan rating klien dan sistem pembayaran aman.*
- CTA: **Order via Fastwork ↗**

### 13. Final CTA + Kontak
- H2 (display besar): **"Siap bikin brand kamu naik level?"**
- Teks: *"Ceritakan project-mu — kami bantu susun solusi desain yang pas dengan budget dan targetmu. Konsultasi gratis, tanpa komitmen."*
- CTA primer: **Mulai Konsultasi via WhatsApp** · sekunder: **Isi Form Order**
- Info: 📍 Jakarta, Indonesia · Instagram **@agdesign.official** · ● Open Project · Respon < 24 jam

### 14. Footer
- Deskripsi: *"Gous Studio — creative design studio di Jakarta untuk brand identity, logo, social media, dan poster design. Membantu UMKM dan personal brand tampil profesional sejak 2019."*
- Kolom **Layanan** (link ke anchor/landing per layanan), **Navigasi**, **Kontak** (email + WA dari `constants.ts`), **Sosial**.
- Bottom: `© 2026 Gous Studio. All rights reserved.` · `Made with care in Jakarta`
- Floating/sticky: **"Chat with us"** → di mobile diganti sticky bar.

---

## 5. Wireframe Teks (Mobile → Desktop)

Legenda: `[BTN]` tombol primer, `(btn)` sekunder, `▢` gambar, `···` marquee, `|` kolom.

### 0. Navbar
```
MOBILE (h-16, sticky, bg paper/80 + blur saat scroll)
┌──────────────────────────────────┐
│ GousStudio              [WA]  ☰ │
└──────────────────────────────────┘
☰ → sheet full-screen: menu besar (display 32px), CTA WA di bawah

DESKTOP
┌──────────────────────────────────────────────────────────────┐
│ GousStudio   Karya Layanan Harga Proses Tentang FAQ  [Chat WA]│
└──────────────────────────────────────────────────────────────┘
```

### 1. Hero
```
MOBILE
┌──────────────────────────────────┐
│ ● Available — slot Oktober       │  eyebrow mono
│                                  │
│ Desain yang                      │  H1 display 40-44px
│ bikin brand                      │
│ kamu diingat,                    │
│ bukan cuma                       │
│ dilihat.                         │  "diingat" = violet-500
│                                  │
│ Subheadline 2-3 baris…           │
│                                  │
│ [ Konsultasi Gratis via WA ]     │  full width, h-14
│ ( Lihat Karya Kami ↓ )           │
│ Dibalas < 24 jam · Tanpa komitmen│
│                                  │
│ ◉◉◉◉ Dipercaya 100+ brand        │
│                                  │
│ ▢▢▢ strip 3 karya auto-scroll    │  horizontal, rasio 4/5
└──────────────────────────────────┘

DESKTOP (marquee di atas, konten rata tengah menumpuk di area fade)
←──────────── marquee karya, bergerak pelan ke kiri ────────────
┌────┐┌──────────┐┌───┐┌──────┐┌────┐┌──────────┐┌───┐┌──────
│ ▢  ││    ▢     ││ ▢ ││  ▢   ││ ▢  ││    ▢     ││ ▢ ││  ▢
│4/5 ││  16/10   ││1/1││ 4/5  ││    ││          ││   ││
│░░░░││░░░░ ● Available — slot Oktober ░░░░││░░░░░░││░░░  ← bawah fade
└────┘└──────────┘└───┘└──────┘└────┘└──────────┘└───┘└──────
          Bikin brand kamu diingat,    (H1 center, 2 baris ≥ md)
             bukan cuma dilihat.
          Subheadline center (maks 56ch)
   [Konsultasi Gratis via WhatsApp]  Lihat Karya Kami ↓
              Dibalas < 24 jam · Tanpa komitmen

 Marquee: paling atas hero (tepat di bawah navbar, section pt-20/md:pt-24),
 full-bleed, tinggi 150px / md 210px, lebar = rasio asli gambar (tidak di-crop),
 radius 20px, jarak 16/20px. Mask gabungan `.gs-fade-xb`: tepi kiri-kanan fade
 8% + bagian bawah fade mulai 60% tinggi (mask-composite intersect).
 Pill "Available" tampil (bisa dimatikan via `SHOW_AVAILABILITY` di HeroSection.tsx).
 Konten: container `-mt-4 md:-mt-8 z-10` sehingga pill "Available" (paper/85
 + blur + shadow halus) dan awal H1 menumpuk di area fade.
 Maks 12 karya, kategori diselang-seling (judul CMS asli didahulukan).
 Pause saat hover/focus; statis bila reduced motion. Gambar gagal dimuat
 dibuang dari strip; tanpa data → tile tipografis (Logo. / Feed. / Poster. …).
```

### 2. Client Marquee
```
MOBILE / DESKTOP
──────────────────────────────────────────────
 Brand yang sudah tumbuh bersama Gous      (label kecil, center)
 ··· Babygear · Katzenesia · My Indo Kitchen · HD Travel ··· →
──────────────────────────────────────────────
Logo tampil **berwarna penuh** (tanpa grayscale/opacity); hover desktop: `scale(1.05)` halus.
Mobile: 1 baris, tinggi logo 28px. Desktop: tinggi logo 40px.
```

### 3. Selected Work
```
MOBILE
┌──────────────────────────────────┐
│ 01 — Selected Work               │
│ Karya yang bicara lebih          │
│ keras dari kata-kata.            │
│ [Semua][Logo][Branding][Sosmed]→ │  chip scroll horizontal
│ ▢ (4/5)                          │
│ LOGO · Katzenesia                │
│ Logo & brand guideline · 2025    │
│ ▢ (4/5)                          │
│ …6 item…                         │
│ ( Lihat Semua Karya → )          │
└──────────────────────────────────┘

DESKTOP
┌──────────────────────────────────────────────────────────────┐
│ 01 — Selected Work                     Deskripsi 1 kalimat   │
│ Karya yang bicara lebih                Lihat Semua Karya →   │
│ keras dari kata-kata.                                        │
│ [Semua] [Logo] [Branding] [Social Media] [Poster]            │
│ ┌────────── 7 ──────────┐ ┌──── 5 ────┐                       │
│ │ ▢ landscape 4/3       │ │ ▢ 4/5     │                       │
│ └───────────────────────┘ └───────────┘                       │
│ ┌──── 5 ────┐ ┌────────── 7 ──────────┐                       │
│ ┌── 4 ──┐ ┌── 4 ──┐ ┌── 4 ──┐  (pola berulang)               │
└──────────────────────────────────────────────────────────────┘
```

### 4. Services (bento)
```
MOBILE: kartu stack 1 kolom, masing-masing:
┌──────────────────────────────────┐
│ 01            ▢ thumbnail kecil  │
│ Brand Identity Design            │
│ Deskripsi 2 baris…               │
│ • Logo suite • Guideline • …     │
│ Mulai Rp ___      Tanya →        │
└──────────────────────────────────┘

DESKTOP (bento 12 kol, 2 baris)
┌────────── 7 (tinggi 2 baris) ──────┬────── 5 ──────┐
│ Brand Identity Design (unggulan)   │ Logo Design    │
│ + gambar karya besar               ├────── 5 ──────┤
│                                    │ Social Media   │
├──── 4 ────┬──── 4 ────┬──── 4 ─────┴────────────────┤
│ Poster    │ Digital   │ Kartu ungu "Butuh paket     │
│           │ Marketing │ lengkap? Lihat harga →"     │
└───────────┴───────────┴─────────────────────────────┘
```

### 5. Why Gous + Angka
```
MOBILE
│ 03 — Kenapa Gous                 │
│ Kualitas agency,                 │
│ kedekatan freelancer.            │
│ ┌ 100+ ┐┌ 200+ ┐                 │  angka 2x2 grid
│ └Klien ┘└Project┘                │
│ ┌ 7+  ┐┌ <24j ┐                  │
│ 1. Dikerjakan desainer senior…   │  list bernomor
│ 2. …                             │

DESKTOP (section ink/gelap)
┌─────────── 5 ───────────┬──────────────── 7 ───────────────┐
│ 03 — Kenapa Gous        │ ┌ 100+ ┐ ┌ 200+ ┐ ┌ 7+ ┐ ┌ <24j ┐ │
│ Kualitas agency,        │ ─────────────────────────────────  │
│ kedekatan freelancer.   │ 01 Dikerjakan… │ 02 Strategi…     │
│                         │ 03 Transparan… │ 04 File lengkap… │
└─────────────────────────┴──────────────────────────────────┘
```

### 6. Testimoni
```
MOBILE: carousel swipe (scroll-snap), 1 kartu ~88% lebar + peek kartu berikut
┌──────────────────────────────────┐
│ "                                │
│ Logonya benar-benar…             │
│                                  │
│ ◉ Budi Santoso                   │
│   Owner, Katzenesia   [logo]     │
└──────────────────────────────────┘
• ○ ○

DESKTOP
┌──── 6 (kutipan besar unggulan) ───┬──── 6 ────────────┐
│ "Logonya benar-benar              │ kartu Sari Putri   │
│  merepresentasikan…" (display 32) ├────────────────────┤
│ ◉ Budi · Katzenesia  ▢ hasil karya│ kartu Andi Wijaya  │
└───────────────────────────────────┴────────────────────┘
```

### 7. Process
```
MOBILE: timeline vertikal
│ 05 — Cara Kerja                  │
│ ●─ 01 Research                   │
│ │  teks…                         │
│ ●─ 02 Concepting                 │
│ │  teks…                         │
│ ●─ 03 Refinement                 │
│ ●─ 04 Delivery                   │

DESKTOP: 4 kolom horizontal, garis progres di atas terisi saat scroll
┌─ 01 ─────┬─ 02 ─────┬─ 03 ─────┬─ 04 ─────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░ │
│ Research │Concepting│Refinement│ Delivery │
│ teks…    │ teks…    │ teks…    │ teks…    │
└──────────┴──────────┴──────────┴──────────┘
```

### 8–9. Paket Hemat + Custom
```
MOBILE: kartu stack; kartu "Paling Laris" paling atas
┌──────────────────────────────────┐
│ [Paling Laris]  (stiker spark)   │
│ Brand Kit UMKM                   │
│ Rp ___  ~~Rp ___~~               │
│ ⏱ __ hari · ↻ __ revisi          │
│ ✓ deliverable 1                  │
│ ✓ deliverable 2                  │
│ [ Pilih Paket Ini ]              │
└──────────────────────────────────┘
✓ DP 50% · ✓ QRIS/transfer
┌ violet-950 ──────────────────────┐
│ Kebutuhanmu nggak ada di paket?  │
│ [ Diskusi Paket Custom ]         │
└──────────────────────────────────┘

DESKTOP
┌──── 4 ────┬──── 4 (naik 16px, border violet) ────┬──── 4 ────┐
│ Starter   │ Brand Kit UMKM  [Paling Laris]       │ Sosmed    │
└───────────┴──────────────────────────────────────┴───────────┘
┌──────────────── 12, bg violet-950, teks putih ───────────────┐
│ Kebutuhanmu nggak ada di paket?   teks…  [Diskusi Custom →]  │
└──────────────────────────────────────────────────────────────┘
```

### 10. About
```
MOBILE
│ 07 — Tentang                     │
│ ▢ foto Agus (4/5, grayscale→warna)│
│ Studio kecil, standar besar.     │
│ teks 2 paragraf…                 │
│ Est.2019 · Jakarta · Figma …     │  chip
│ — Agus Budiman (tanda tangan)    │
│ ( Kenalan via WhatsApp )         │

DESKTOP
┌──── 5: foto founder ────┬──── 7: H2 + teks + fakta + CTA ────┐
```

### 11. FAQ
```
MOBILE/DESKTOP: accordion (shadcn Accordion), desktop 2 kolom
┌──── 4: H2 + "Masih ada pertanyaan? Chat kami" ─┬── 8: accordion ──┐
```

### 12. Fastwork
```
Strip satu baris:
┌ [logo Fastwork] Lebih nyaman order lewat platform? … (Order via Fastwork ↗) ┐
Mobile: stack, tombol full width.
```

### 13. Final CTA + Kontak
```
DESKTOP (section ink, full-bleed)
┌──────────────────────────────────────────────────────────────┐
│ Siap bikin brand                                             │
│ kamu naik level?               (display 96px)                │
│ teks…                                                        │
│ [Mulai Konsultasi via WA]  (Isi Form Order)                  │
│ ───────────────────────────────────────────────────────────  │
│ 📍 Jakarta │ IG @agdesign.official │ ● Open Project │ <24 jam │
└──────────────────────────────────────────────────────────────┘
MOBILE: sama, stack; info kontak 2x2 grid.
```

### 14. Footer + Sticky bar
```
DESKTOP (ink)
┌─── 4: logo + deskripsi ─┬ 2: Layanan ┬ 2: Navigasi ┬ 4: Kontak ┐
│ GOUSSTUDIO (wordmark raksasa selebar container, opacity 8%)   │
│ © 2026 Gous Studio            Made with care in Jakarta       │

MOBILE sticky bottom bar (muncul setelah hero lewat, hilang saat footer terlihat)
┌──────────────────────────────────┐
│ ● Respon <24j   [ Chat WhatsApp ]│  h-16, safe-area-inset-bottom
└──────────────────────────────────┘
```

---

## 6. Interaksi & Animasi

Prinsip: **halus, cepat, bermakna.** Semua animasi pakai `transform`/`opacity` saja; durasi 200–600ms; easing `--ease-out-expo`. Wajib hormati `prefers-reduced-motion` (`useReducedMotion()` dari Framer Motion → matikan reveal, parallax, marquee berhenti).

| Elemen | Interaksi | Implementasi |
|---|---|---|
| **Scroll reveal** | Fade + translateY 24px → 0, sekali saja; stagger 60ms antar anak | `motion.div` + `whileInView`, `viewport={{ once: true, margin: "-10% 0px" }}`. Buat 1 komponen `<Reveal>` reusable. Hero **tidak** di-reveal (LCP). |
| **Headline hero** | Per baris muncul (mask slide-up) saat load, total < 700ms | `overflow-hidden` per baris + `y: "100%" → 0`. Teks tetap ada di DOM sejak SSR/prerender. |
| **Marquee logo** | Jalan otomatis, pause saat hover/focus, arah berlawanan untuk baris ke-2 (opsional) | CSS `@keyframes` + `animation-play-state: paused` on hover — **bukan** JS. Duplikasi list dengan `aria-hidden="true"` untuk salinan kedua. |
| **Filter portofolio** | Chip aktif berpindah dengan "pill" yang meluncur; grid re-layout halus | `layoutId="filter-pill"` untuk indikator; `AnimatePresence mode="popLayout"` + `layout` pada kartu. Filter = `<button role="tab">` dengan `aria-selected`. Sinkronkan ke URL `?cat=logo`. |
| **Kartu karya** | Hover: img `scale 1.03`, judul geser 4px, kursor "Lihat" | Hanya di `@media (hover: hover)`. Focus-visible ring violet sama dengan hover. |
| **Tombol primer** | Hover: bg violet-700, ikon panah geser 3px; active `scale .98` | Tailwind transition 200ms. Jangan `translateY` + glow besar. |
| **Angka** | Count-up sekali saat terlihat | `useInView` + `animate()` Framer, 1.2s; nilai final ada di DOM untuk SR (`aria-label`). |
| **Process** | Garis progres terisi sesuai scroll | `useScroll({ target })` + `scaleX`. |
| **Marquee karya hero** | Strip karya bergerak pelan ke kiri, loop tanpa jeda, pause saat hover/focus | CSS `@keyframes gs-marquee` (`translateX(-50%)`) atas 2 salinan list; jarak via `margin-right` per item (bukan `gap`) agar loop mulus; durasi = jumlah karya × 6s (min 45s); salinan kedua `aria-hidden`. |
| **Navbar** | Transparan → bg paper/80 + blur + border saat scroll > 24px; sembunyi saat scroll turun, muncul saat naik | `useScroll` + `useMotionValueEvent`. |
| **Sticky CTA mobile** | Slide-up setelah hero lewat | `IntersectionObserver` pada hero & footer. |
| **FAQ** | Accordion expand tinggi | shadcn `Accordion` (Radix) — aksesibel by default. |

**Cursor** — semua elemen yang bisa diklik wajib `cursor: pointer`. Aturan global di `@layer base` (`src/index.css`, blok `CURSOR`) mencakup `a[href]`, `button`, `summary`, `select`, `label[for]`, role `button/tab/option/link/menuitem/checkbox/switch`, dan input checkbox/radio/date/file/color/range; elemen `:disabled`/`aria-disabled` → `not-allowed`. Elemen non-semantik yang diberi `onClick` (backdrop modal, area kosong lightbox) menambahkan `cursor-pointer` sendiri — hanya saat klik benar-benar melakukan sesuatu (mis. backdrop modal order tidak pointer bila form sudah diisi). Gambar di lightbox yang bisa di-swipe: `cursor-grab` / `active:cursor-grabbing`. Komponen baru: pakai elemen semantik (`button`/`a`) agar otomatis tercakup.

Yang dilarang: smooth-scroll hijack (Lenis dsb. boleh hanya jika tidak merusak native scroll mobile), typing effect, animasi loop di luar marquee, autoplay video dengan suara.

---

## 7. Penempatan Bukti Sosial

Trust dibangun **berlapis dan sedini mungkin**:

| Posisi | Bukti | Bentuk |
|---|---|---|
| Hero (above the fold) | ~~Jumlah klien + avatar logo~~ — **dihapus** dari hero; angka 100+ klien tampil di section Why Gous dan logo klien di marquee tepat di bawah hero | — |
| Hero visual | Karya nyata, bukan ilustrasi stok | Collage 3 karya terbaik |
| Tepat setelah hero | 11 logo klien | Marquee |
| Portfolio | Nama klien di setiap karya | Caption "LOGO · Katzenesia" |
| Services | Thumbnail karya per layanan | Bukti spesifik per kebutuhan |
| Why Gous | Angka 100+/200+/7+/<24j | Count-up, tipografi display |
| Testimoni | Nama, jabatan, brand, **foto/logo**, **hasil karya terkait** | Kartu + thumbnail; kutipan dengan hasil terukur diprioritaskan |
| Pricing | Pengurang risiko | DP 50%, revisi, metode bayar, "Paling Laris" |
| Dekat setiap CTA WA | Respon cepat | Microcopy "Dibalas < 24 jam" |
| FAQ | Jawaban transparan | Menghilangkan keraguan sebelum chat |

Opsional fase 2: mini case study (Problem → Solusi → Hasil) untuk 2–3 klien unggulan (Katzenesia, SpeakGuru, Lakuna) di `/portfolio/[slug]`.

---

## 8. SEO On-Page

### Target keyword & penempatan
| Keyword | Penempatan utama |
|---|---|
| **jasa desain grafis** | Meta title, H1 tersirat → gunakan di subheadline & H2 Services, footer |
| **desain logo** | Kartu Logo Design (H3), alt gambar portfolio logo, FAQ #1 |
| **brand identity** | Kartu Brand Identity (H3), About |
| **social media design** | Kartu Social Media (H3), filter portfolio |
| **poster design** | Kartu Poster (H3), filter portfolio |
| **graphic design jakarta** | Meta description, footer, About ("studio di Jakarta"), schema `address` |

### Meta
```html
<title>Jasa Desain Grafis Jakarta — Logo & Brand Identity | Gous Studio</title>
<!-- 63 karakter; alternatif ≤60: "Jasa Desain Logo & Brand Identity Jakarta | Gous Studio" (56) -->

<meta name="description" content="Gous Studio, studio desain grafis di Jakarta untuk desain logo, brand identity, social media design, dan poster design. 7+ tahun, 100+ klien. Konsultasi gratis via WhatsApp.">
<!-- 177 → potong ke ≤160 bila perlu: "Studio desain grafis di Jakarta: desain logo, brand identity, social media & poster design. 7+ tahun, 100+ klien. Konsultasi gratis via WhatsApp." (151) -->
```
- OG/Twitter title & description sama; buat **OG image 1200×630** baru dengan visual brand baru.
- `canonical` per halaman (Home, `/portfolio`, `/pricelist`).
- Hapus `meta keywords`, `revisit-after`, `language` (diabaikan mesin pencari).

### Struktur heading
- **Satu H1** di hero = headline copy. Jangan menyelipkan keyword tersembunyi di H1; taruh "jasa desain grafis" di subheadline `<p>` dan meta title. Google menimbang title + konten, bukan hanya H1.
- H2 per section, H3 per kartu. Jangan lompat level.

### Structured data (JSON-LD)
- `ProfessionalService` (atau `LocalBusiness`): name, url, logo, image, `address` (Jakarta, ID), `telephone`, `email`, `areaServed: "Indonesia"`, `priceRange`, `sameAs` (Instagram, Fastwork), `foundingDate: "2019"`, `founder: { Person: Agus Budiman }`.
- `Service` untuk 5 layanan (dengan `offers.price` saat harga final).
- `FAQPage` dari section FAQ.
- `Review`/`AggregateRating` **hanya** jika rating dapat diverifikasi (risiko penalti rich result jika self-serving).

### Teknis
- **Prerender/SSR halaman publik** (lihat §0 Catatan stack) — saat ini SPA Vite, konten Supabase tidak terlihat crawler tanpa JS.
- Gambar: WebP/AVIF, `width`/`height` eksplisit, `loading="lazy"` kecuali gambar hero (`fetchpriority="high"`), `alt` deskriptif: *"Desain logo Katzenesia — brand identity pet shop oleh Gous Studio"*.
- Nama file gambar ber-keyword: `desain-logo-katzenesia.webp`.
- Internal link: kartu layanan → `/pricelist?cat=...`, footer → anchor section & halaman.
- `sitemap.xml` update otomatis termasuk `/portfolio/[slug]` (fase 2).
- Target Core Web Vitals: **LCP < 2.5s, CLS < 0.1, INP < 200ms** di 4G mobile.
- Google Business Profile "Gous Studio — Jakarta" dengan link ke situs (dampak besar untuk "graphic design jakarta").

---

## 9. Daftar Aset yang Perlu Disiapkan

### Wajib sebelum development selesai
- [ ] **Keputusan kontak resmi:** satu nomor WhatsApp + satu email (lihat §0 #3).
- [ ] **Harga final** 5 layanan ("mulai dari") + 3 paket hemat: harga, harga coret, durasi, jumlah revisi, deliverables.
- [ ] **12–18 karya portofolio terbaik** (min. 3 per kategori Logo/Branding/Social Media/Poster), masing-masing: nama klien, kategori, tahun, 1 kalimat hasil, izin tampil dari klien.
- [ ] **Mockup konsisten** untuk semua karya: satu set template (kartu nama, kemasan, feed IG 3×3, poster di dinding) dengan background `paper-200` — ekspor WebP 1600px & 800px.
- [ ] **3 karya hero** (rasio 4/5, 1200px) — paling representatif & paling "wah".
- [ ] **Logo 11 klien** dalam **SVG** (atau PNG transparan ≥ 400px), versi monokrom gelap + terang, plus izin penggunaan.
- [ ] **Foto founder** Agus Budiman — potret profesional 4/5, latar netral, plus 1–2 foto suasana kerja (meja, sketsa, layar Figma).
- [ ] **Foto/avatar 3 pemberi testimoni** (atau logo brand mereka) + persetujuan teks kutipan final + angka hasil bila ada.
- [ ] **Font Neue Machina weight Bold/Ultrabold** (lisensi web) — atau setujui pengganti Space Grotesk/Clash Display.
- [ ] **OG image** 1200×630 dengan identitas baru.
- [ ] **Jawaban FAQ** final (durasi, revisi, pembayaran, hak cipta).
- [ ] **Link & rating Fastwork** terverifikasi.

### Nice to have
- [ ] Logo/wordmark "GousStudio" versi SVG yang di-refresh (monogram "G" untuk favicon & stiker).
- [ ] Showreel pendek (10–15 detik, MP4/WebM < 2 MB, tanpa suara) untuk hero desktop.
- [ ] 2–3 mini case study (brief, proses, hasil, angka).
- [ ] Stiker/badge grafis: "Est. 2019", "Made in Jakarta", "Paling Laris".
- [ ] Ikon set custom (atau tetap Lucide, stroke 1.5).

---

## Lampiran A — Checklist Implementasi Developer

1. Ganti token di `src/index.css` sesuai §2.2; hapus kelas neon/glass/blob.
2. Perbaiki font (§0 #4, #5), preload 2 file utama.
3. Satukan kontak di `src/config/constants.ts`; buat helper `waLink(context, item?)`.
4. Pasang shadcn/ui (Button, Badge, Accordion, Sheet, Tabs/ToggleGroup, Carousel).
5. Buat komponen dasar: `<Section eyebrow title description action>`, `<Reveal>`, `<WaButton context>`, `<Marquee>`, `<StickyCta>`.
6. Bangun ulang section sesuai urutan §3; data Supabase via React Query dengan skeleton berdimensi tetap.
7. Tambah section FAQ + JSON-LD (`ProfessionalService`, `Service`, `FAQPage`).
8. Update meta di `index.html` & `Helmet` (§8); seragamkan "7+ tahun".
9. Prerender halaman publik; uji Lighthouse mobile (target ≥ 90 semua kategori).
10. Uji aksesibilitas: navigasi keyboard penuh, focus ring terlihat, kontras AA, `prefers-reduced-motion`, label tombol ikon (`aria-label="Chat WhatsApp"`).
11. Pasang event analytics: `wa_click {section, item}`, `portfolio_filter {cat}`, `order_form_open`.
12. Hapus file duplikat `.jsx` (§0 #8).

## Lampiran B — Komponen & Status

| Komponen lama | Nasib |
|---|---|
| `Hero.tsx` | Tulis ulang (hapus typing effect) |
| `Clients.tsx` | Refactor jadi `<Marquee>` CSS |
| `Portfolio.tsx` + `PortfolioCard.tsx` | Tulis ulang grid editorial + filter `layoutId` |
| `Services.tsx` | Tulis ulang bento; hapus `COLOR_STYLES` multi-warna |
| `Process.tsx` | Refactor timeline + progress scroll |
| `PricelistPreview.tsx` | Refactor 3 kartu + banner Custom |
| `Testimonials.tsx` | Refactor; hapus `Testimonials.jsx` |
| `FastworkPromo.tsx` | Sederhanakan jadi strip |
| `About.tsx` | Tulis ulang founder-centric |
| `Contact.tsx` | Gabung ke Final CTA |
| `Footer.tsx` | Refactor + wordmark besar |
| `ui/FloatingWhatsApp.tsx` | Desktop saja; mobile pakai `<StickyCta>` |
| *(baru)* `Faq.tsx`, `WhyGous.tsx`, `StickyCta.tsx`, `Section.tsx`, `Reveal.tsx` | Buat |
