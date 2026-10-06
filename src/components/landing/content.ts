import { CONFIG } from "../../config/constants";

// Copy & static content for the landing page. Source: docs/DESIGN.md §4.

export const waLink = (message: string, context?: string) => {
  const text = context ? `${message} [${context}]` : message;
  return `https://wa.me/${CONFIG.PUBLIC_WA_NUMBER}?text=${encodeURIComponent(text)}`;
};

export const WA_DEFAULT_MESSAGE =
  "Halo Gous Studio, saya mau konsultasi soal kebutuhan desain brand saya.";

export const NAV_ITEMS = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Layanan", href: "/#layanan" },
  { label: "Harga", href: "/pricelist" },
  { label: "Proses", href: "/#proses" },
  { label: "Tentang", href: "/#tentang" },
  { label: "FAQ", href: "/#faq" },
];

export const STATS = [
  { value: 100, suffix: "+", label: "Klien" },
  { value: 200, suffix: "+", label: "Project" },
  { value: 7, suffix: "+", label: "Tahun" },
  { value: 24, prefix: "<", suffix: " jam", label: "Waktu respon" },
];

export const FALLBACK_CLIENTS = [
  { name: "Babygear", src: "/img/clients/client-babygear.png" },
  { name: "Katzenesia", src: "/img/clients/client-katzenesia.png" },
  { name: "My Indo Kitchen", src: "/img/clients/client-myindo.png" },
  { name: "HD Travel", src: "/img/clients/client-hdtravel.png" },
  { name: "Speakgurus", src: "/img/clients/client-speakguru.png" },
  { name: "Gajatech", src: "/img/clients/client-gajatech.png" },
  { name: "Republik Cikicow", src: "/img/clients/client-cikicow.png" },
  { name: "LB Glow", src: "/img/clients/client-lbglow.png" },
  { name: "Lakuna Korean", src: "/img/clients/client-lakuna.png" },
  { name: "Bekasi Cat House", src: "/img/clients/client-bch.png" },
  { name: "Annise Herbal", src: "/img/clients/client-anniseherbal.png" },
];

export type ServiceCard = {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
};

// Static copy of the CMS services, shown only while the services request is loading or if it fails.

export const SERVICES: ServiceCard[] = [
  {
    id: "brand-identity",
    title: "Brand Identity Design",
    description:
      "Sistem visual utuh — logo, warna, tipografi, sampai panduan — agar brand konsisten di semua tempat.",
    deliverables: ["Logo suite", "Palet & font", "Brand guideline", "Mockup"],
  },
  {
    id: "logo",
    title: "Logo Design",
    description:
      "Logo yang simpel, unik, dan tetap tajam dari stiker kemasan sampai billboard.",
    deliverables: ["3 konsep awal", "File AI/PNG/SVG", "Variasi warna"],
  },
  {
    id: "social-media",
    title: "Social Media Design",
    description:
      "Feed Instagram yang rapi, on-brand, dan bikin orang berhenti scroll.",
    deliverables: ["Template feed & story", "Konten bulanan", "Highlight cover"],
  },
  {
    id: "poster",
    title: "Poster Design",
    description:
      "Poster event & promo yang artistik tapi informasinya tetap jelas dibaca.",
    deliverables: ["Poster cetak/digital", "Adaptasi feed & story"],
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing Design",
    description:
      "Banner ads, katalog, dan aset marketplace yang mendorong klik.",
    deliverables: ["Banner ads", "Katalog", "Aset e-commerce"],
  },
];

export const WHY_POINTS = [
  {
    title: "Dikerjakan langsung desainer senior",
    body: "Bukan dilempar ke junior. Kamu ngobrol langsung dengan orang yang mendesain.",
  },
  {
    title: "Strategi dulu, baru estetika",
    body: "Setiap desain berangkat dari riset audiens dan kompetitor, bukan sekadar selera.",
  },
  {
    title: "Proses transparan",
    body: "Progres bisa dipantau, revisi jelas, timeline disepakati di awal.",
  },
  {
    title: "File lengkap, siap pakai",
    body: "Semua format master & turunan, plus panduan penggunaan.",
  },
];

export const PROCESS_STEPS = [
  {
    title: "Research",
    body: "Kami pelajari bisnismu, target audiens, dan kompetitor untuk menemukan apa yang membuat brand kamu berbeda.",
  },
  {
    title: "Concepting",
    body: "Ide dieksplorasi jadi beberapa arah konsep. Kamu pilih yang paling mewakili visi brand.",
  },
  {
    title: "Refinement",
    body: "Konsep terpilih dipoles detail demi detail, dengan revisi terarah sampai benar-benar pas.",
  },
  {
    title: "Delivery",
    body: "File final lengkap dalam semua format yang kamu butuhkan, plus panduan agar brand tetap konsisten.",
  },
];

export const FALLBACK_TESTIMONIALS = [
  {
    name: "Budi Santoso",
    title: "Owner, Katzenesia",
    testimony:
      "Logonya benar-benar merepresentasikan Katzenesia. Prosesnya cepat, komunikatif, dan hasilnya melebihi ekspektasi.",
    avatar_url: "/img/clients/testi-1.png",
  },
  {
    name: "Sari Putri",
    title: "Marketing, SpeakGuru",
    testimony:
      "Sejak feed Instagram kami dirapikan Gous Studio, tampilannya jauh lebih profesional dan engagement naik signifikan.",
    avatar_url: "/img/clients/testi-2.png",
  },
  {
    name: "Andi Wijaya",
    title: "Event Manager, Lakuna",
    testimony:
      "Posternya artistik tapi informasinya tetap mudah dibaca. Klien kami sangat puas.",
    avatar_url: "/img/clients/testi-3.png",
  },
];

// TODO(owner): confirm final answers (docs/DESIGN.md §4.11).
export const FAQS = [
  {
    q: "Berapa lama pengerjaan desain?",
    a: "Tergantung paket. Durasi pengerjaan tertera di setiap paket harga, dan timeline disepakati di awal sebelum project dimulai.",
  },
  {
    q: "Berapa kali revisi yang saya dapat?",
    a: "Sesuai paket yang dipilih — jumlah revisi tertera jelas di setiap kartu harga. Beberapa paket punya revisi unlimited.",
  },
  {
    q: "Bagaimana sistem pembayarannya?",
    a: "Pembayaran bisa via QRIS, transfer bank, atau e-wallet. Detail DP dan pelunasan dijelaskan saat konfirmasi order.",
  },
  {
    q: "File apa saja yang saya terima?",
    a: "File master dan turunan siap pakai (misalnya AI, PDF, SVG, PNG transparan, JPG), disesuaikan dengan kebutuhan layanan.",
  },
  {
    q: "Apakah bisa untuk klien di luar Jakarta?",
    a: "Bisa. Seluruh proses — brief, presentasi konsep, revisi, sampai serah terima file — berjalan online.",
  },
  {
    q: "Apakah hak penggunaan desain jadi milik saya?",
    a: "Ya. Setelah pelunasan, desain final sepenuhnya bisa kamu gunakan untuk kebutuhan brand-mu.",
  },
];

// Order flow shown on package detail pages (from the previous detail page copy).
export const ORDER_STEPS = [
  { title: "Briefing", body: "Ceritakan kebutuhan, referensi, dan target brand-mu lewat WhatsApp atau form order." },
  { title: "Pembayaran DP", body: "DP 50% untuk mengunci jadwal dan masuk antrean pengerjaan." },
  { title: "Desain", body: "Desain dikerjakan sesuai brief dan timeline yang disepakati." },
  { title: "Revisi", body: "Penyesuaian sesuai jatah revisi paket sampai desain terasa pas." },
  { title: "Serah terima", body: "Pelunasan, lalu file final dikirim lengkap dan siap pakai." },
];

