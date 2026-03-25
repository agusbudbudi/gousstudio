import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Tag,
  Check,
  Clock,
  RefreshCw,
  Infinity,
  Package,
  Zap,
  ShoppingCart,
  Search,
} from "lucide-react";
import { supabase } from "../utils/supabase";
import { useAppStore } from "../store/useAppStore";
import AnimatedPage from "../ui/AnimatedPage";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const getDiscountPercent = (retail: number, final: number) =>
  Math.round(((retail - final) / retail) * 100);

const categoryMeta = {
  All: { color: "brand", label: "Semua Layanan" },
  "Brand Identity": { color: "brand", label: "Brand Identity" },
  "Print & Digital": { color: "orange", label: "Print & Digital" },
  "Social Media": { color: "pink", label: "Social Media" },
  Management: { color: "neon", label: "Management" },
};

const categoryColorMap = {
  "Brand Identity": {
    badge: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    accent: "from-orange-500/10 to-transparent border-orange-500/20",
    check: "text-orange-400",
    btn: "from-orange-500 to-orange-600 shadow-orange-500/30",
    divider: "from-orange-500/30 to-transparent",
  },
  "Print & Digital": {
    badge: "text-neon-orange bg-orange-500/10 border-orange-400/20",
    accent: "from-yellow-500/10 to-transparent border-yellow-500/20",
    check: "text-yellow-400",
    btn: "from-yellow-500 to-orange-500 shadow-yellow-500/30",
    divider: "from-yellow-400/30 to-transparent",
  },
  "Social Media": {
    badge: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    accent: "from-pink-500/10 to-transparent border-pink-500/20",
    check: "text-pink-400",
    btn: "from-pink-500 to-rose-600 shadow-pink-500/30",
    divider: "from-pink-400/30 to-transparent",
  },
  Management: {
    badge: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    accent: "from-violet-500/10 to-transparent border-violet-500/20",
    check: "text-violet-400",
    btn: "from-violet-500 to-indigo-600 shadow-violet-500/30",
    divider: "from-violet-400/30 to-transparent",
  },
};

interface PriceItem {
  id: string;
  category: string;
  serviceName: string;
  description: string;
  retailPrice: number;
  finalPrice: number;
  duration: number;
  isRevisionUnlimited: boolean;
  totalRevision: number;
  deliverables: string[];
  isShowToCustomer: boolean;
}

const PriceCard = ({ item }: { item: PriceItem }) => {
  const { openOrderModal } = useAppStore();
  const discount = getDiscountPercent(item.retailPrice, item.finalPrice);
  const isBestValue = discount >= 25;
  const colors =
    (categoryColorMap as any)[item.category] || categoryColorMap["Brand Identity"];

  return (
    <div
      className={`group relative rounded-2xl border bg-gradient-to-br ${colors.accent} glass flex flex-col overflow-hidden h-full`}
      style={{
        transition:
          "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: "cardFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-8px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* Best Value badge */}
      {/* Best Value ribbon — full-width, fades to transparent on the left */}
      {isBestValue && (
        <div
          className="absolute top-0 left-0 right-0 z-[9] flex items-center justify-end gap-1 px-3 py-1 text-[10px] font-black uppercase tracking-widest"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, rgba(255,119,57,0.85) 60%, rgba(236,72,153,0.95) 100%)",
            color: "#ffffff",
          }}
        >
          <Zap size={9} />
          Best Value
        </div>
      )}

      {/* Discount ribbon — horizontal top-left */}
      {discount > 0 && (
        <div
          className="absolute top-0 left-0 z-10 flex items-center gap-1 px-3 py-1 bg-red-500 text-[10px] font-black tracking-widest rounded-tl-2xl rounded-br-2xl shadow-md"
          style={{ color: "#ffffff" }}
        >
          -{discount}% OFF
        </div>
      )}

      <div className="p-6 pt-8 flex flex-col gap-5 flex-1">
        {/* Category + Name */}
        <div className="mt-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.15em] border ${colors.badge} mb-3`}
          >
            <Tag size={9} />
            {item.category}
          </span>
          <h3 className="text-lg font-black text-white leading-snug">
            {item.serviceName}
          </h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Divider */}
        <div className={`h-px w-full bg-gradient-to-r ${colors.divider}`} />

        {/* Price */}
        <div className="space-y-1">
          {item.retailPrice !== item.finalPrice && (
            <p className="text-slate-500 text-xs line-through">
              {formatPrice(item.retailPrice)}
            </p>
          )}
          <p className="text-3xl font-black text-white tracking-tight">
            {formatPrice(item.finalPrice)}
          </p>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock size={13} className="text-slate-500" />
            <span>{item.duration} hari pengerjaan</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            {item.isRevisionUnlimited ? (
              <>
                <Infinity size={13} className={colors.check} />
                <span className="font-semibold text-white">
                  Unlimited Revisi
                </span>
              </>
            ) : (
              <>
                <RefreshCw size={13} className="text-slate-500" />
                <span>{item.totalRevision}x Revisi</span>
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px w-full bg-gradient-to-r ${colors.divider}`} />

        {/* Deliverables */}
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-slate-500 font-black">
            <Package size={10} />
            Yang Kamu Dapat
          </p>
          <ul className="space-y-1.5">
            {item.deliverables.map((d: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-slate-300"
              >
                <Check
                  size={13}
                  className={`${colors.check} mt-0.5 shrink-0`}
                />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-6 pb-6">
        <button
          onClick={() => openOrderModal(item)}
          className={`w-full py-3 rounded-xl bg-gradient-to-r ${colors.btn} text-sm font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer`}
          style={{
            color: "#ffffff",
            transition:
              "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "";
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
        >
          <ShoppingCart size={15} />
          Order Sekarang
        </button>
      </div>
    </div>
  );
};

const PricelistPage = () => {
  const { openOrderModal } = useAppStore();
  const [pricelistItems, setPricelistItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPricelists = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("pricelists")
          .select("*")
          .order("order_index", { ascending: true });
        if (fetchError) throw fetchError;

        const mapped: PriceItem[] = (data || []).map((row) => ({
          id: row.slug || row.servicename,
          category: row.category,
          serviceName: row.servicename,
          description: row.description,
          retailPrice: Number(row.retailprice ?? 0),
          finalPrice: Number(row.finalprice ?? 0),
          duration: Number(row.duration ?? 1),
          isRevisionUnlimited: Boolean(row.isrevisionunlimited),
          totalRevision: Number(row.totalrevision ?? 0),
          deliverables: row.deliverables || [],
          isShowToCustomer: Boolean(row.is_show_to_customer ?? false),
        })).filter((item) => item.isShowToCustomer);

        if (!cancelled) setPricelistItems(mapped);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load pricelist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPricelists();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(pricelistItems.map((i) => i.category))];
    return cats;
  }, [pricelistItems]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return pricelistItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, pricelistItems]);

  return (
    <AnimatedPage>
      <Helmet>
        <title>Price List | Gous Studio</title>
        <meta
          name="description"
          content="Lihat paket harga layanan desain grafis, branding, social media, dan manajemen dari Gous Studio. Transparan, kompetitif, dan berkualitas."
        />
        <meta property="og:title" content="Price List | Gous Studio" />
        <meta
          property="og:description"
          content="Paket harga desain grafis & branding terbaik dari Gous Studio."
        />
      </Helmet>

      {/* Hero */}
      <section className="hero-grid-bg relative flex flex-col items-center justify-center px-4 text-center overflow-hidden pt-36 pb-12">
        <div
          className="blob w-80 h-80 bg-brand-500 top-0 -left-20"
          style={{ opacity: 0.4 }}
        />
        <div
          className="blob w-64 h-64 bg-neon top-20 -right-20"
          style={{ animationDelay: "-6s", opacity: 0.3 }}
        />
        <div
          className="blob w-56 h-56 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "var(--color-neon-pink)",
            opacity: 0.15,
            animationDelay: "-3s",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto reveal visible">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass neon-border text-xs text-brand-400 font-medium mb-6">
            <Tag size={13} />
            Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
            Harga <span className="text-gradient">Jelas & Kompetitif</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-10">
            Semua harga tercantum dengan transparan. Pilih paket yang sesuai
            kebutuhanmu dan mulai kolaborasi hari ini.
          </p>

          {/* Branded Gradient Spotlight Search */}
          <div
            className="relative max-w-2xl mx-auto w-full px-4 reveal"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative group">
              <div className="relative flex items-center bg-[var(--color-card)] neon-border rounded-2xl px-7 py-4 border border-[var(--color-border-adaptive)] shadow-xl shadow-black/5 transition-all duration-300">
                <Search
                  className="text-[var(--color-text-muted)] mr-4 transition-colors group-focus-within:text-[var(--color-brand)]"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari layanan, deskripsi, atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-lg font-medium text-[var(--color-text-title)] placeholder-[var(--color-text-muted)] placeholder:opacity-40 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-title)] transition-colors cursor-pointer"
                  >
                    <RefreshCw size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Subtle Quick Search Chips */}
            <div className="mt-4 flex flex-wrap justify-center items-center gap-1 text-xs font-semibold tracking-wide">
              <span className="text-[var(--color-text-muted)] opacity-60 mr-1 flex items-center gap-1.5">
                <Zap size={14} className="text-[var(--color-brand)]" /> Quick
                Search:
              </span>
              {[
                { label: "Logo", q: "Logo" },
                { label: "Social Media", q: "Sosmed" },
                { label: "Branding", q: "Brand" },
                { label: "Digital", q: "Digital" },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setSearchQuery(chip.q)}
                  className="px-3 py-1.5 rounded-full border border-[var(--color-border-adaptive)] bg-[var(--color-card)] text-[var(--color-text-muted)] hover:border-brand-500/40 hover:text-[var(--color-brand)] transition-all cursor-pointer active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs (Sticky) */}
      <section className="py-2 px-3 sticky top-15 z-30 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border-adaptive)]">
        <div className="max-w-[1400px] mx-auto md:px-6">
          <div className="flex md:justify-center overflow-x-auto scrollbar-hide">
            <div className="inline-flex items-center p-1.5 glass neon-border rounded-2xl gap-1 w-max mx-auto md:mx-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-brand-500 text-white neon-glow"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-title)]"
                  }`}
                >
                  {cat === "All" ? "Semua" : cat}
                  {cat === "All" ? (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-white/10">
                      {pricelistItems.length}
                    </span>
                  ) : (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-white/10">
                      {pricelistItems.filter((i) => i.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Price Cards Grid */}
      <section className="py-12 px-3">
        <div className="max-w-[1400px] mx-auto md:px-6">
          {/* Removed Count info as requested */}

          {error ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-xl w-full">
                <p className="text-red-400 font-bold mb-2">Gagal memuat paket</p>
                <p className="text-slate-400 text-sm">{error}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-100">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-medium">Memuat paket layanan...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item, index) => (
                <div
                  key={item.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="h-full"
                >
                  <PriceCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-100 transition-opacity duration-300">
              <div className="w-20 h-20 mb-5 rounded-full bg-[var(--color-card)] border border-[var(--color-border-adaptive)] flex items-center justify-center">
                <Search
                  size={32}
                  className="text-[var(--color-text-muted)] opacity-70"
                />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-title)] mb-2">
                Paket tidak ditemukan
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Kami tidak menemukan paket dengan kata kunci{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  "{searchQuery}"
                </span>{" "}
                di kategori{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  {activeCategory === "All" ? "Semua" : activeCategory}
                </span>
                .
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="px-6 py-2.5 text-sm rounded-xl bg-[var(--color-brand)] hover:bg-brand-600 text-[#ffffff] font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95 flex items-center gap-2"
                style={{ color: "#ffffff" }}
              >
                <RefreshCw size={16} color="#ffffff" />
                <span style={{ color: "#ffffff" }}>Reset Pencarian</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA / Custom Package Section - Compact Version */}
      <section className="mt-16 py-12 px-4 relative overflow-hidden bg-brand-gradient">
        {/* Decorative blobs - Smaller */}
        <div className="blob w-64 h-64 bg-brand-500/10 -top-10 -right-10 opacity-50" />
        <div
          className="blob w-48 h-48 bg-neon-pink/10 -bottom-10 -left-10 opacity-30"
          style={{ animationDelay: "-4s" }}
        />

        <div className="max-w-[1400px] mx-auto md:px-6 relative z-10 reveal flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-3xl px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-[9px] text-brand-400 font-black uppercase tracking-widest mb-4">
              <Zap size={10} /> Personalized Service
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight">
              Butuh Paket <span className="text-gradient">Custom?</span> Harga
              Bisa Diskusikan
            </h2>

            <p className="text-slate-400 text-base leading-relaxed">
              Kalau kebutuhan desainmu berbeda dari paket di atas atau ingin
              kolaborasi jangka panjang, ceritain dulu ke kami — kami siap bikin
              penawaran yang sesuai budget & ekspektasimu.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 shrink-0 px-2 lg:mt-6">
            <button
              onClick={() =>
                openOrderModal({
                  serviceName: "Custom Package",
                  category: "Other",
                  deliverables: ["Sesuai diskusi"],
                })
              }
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-500 text-white font-black text-lg transition-all duration-300 shadow-[0_0_20px_rgba(255,119,57,0.3)] hover:shadow-[0_0_40px_rgba(255,119,57,0.4)] hover:scale-105 active:scale-[0.98] cursor-pointer"
            >
              <ShoppingCart
                size={22}
                className="group-hover:rotate-12 transition-transform"
              />
              Diskusi Custom Package
            </button>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              Respon Cepat via WhatsApp
            </p>
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
};

export default PricelistPage;
