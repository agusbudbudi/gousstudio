import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Tag,
  ShoppingCart,
  ArrowRight,
  Zap,
  Clock,
  RefreshCw,
  Infinity,
  Check,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import pricelistData from "../data/pricelist.json";

const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const getDiscountPercent = (retail, final) =>
  Math.round(((retail - final) / retail) * 100);

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

const PreviewCard = ({ item }) => {
  const { openOrderModal } = useAppStore();
  const discount = getDiscountPercent(item.retailPrice, item.finalPrice);
  const isBestValue = discount >= 25;
  const colors =
    categoryColorMap[item.category] || categoryColorMap["Brand Identity"];

  return (
    <div
      className={`group relative rounded-2xl border bg-gradient-to-br ${colors.accent} glass flex flex-col overflow-hidden h-full reveal`}
      style={{
        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animation: "cardFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-8px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
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

      <div className="p-6 pt-8 flex flex-col gap-4 flex-1">
        <div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.15em] border ${colors.badge} mb-3`}
          >
            <Tag size={9} />
            {item.category}
          </span>
          <h3 className="text-lg font-black text-white leading-snug group-hover:text-brand-400 transition-colors">
            {item.serviceName}
          </h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        <div className={`h-px w-full bg-gradient-to-r ${colors.divider}`} />

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

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Clock size={12} className="text-slate-500" />
            <span>{item.duration} hari</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            {item.isRevisionUnlimited ? (
              <>
                <Infinity size={12} className={colors.check} />
                <span className="font-semibold text-white">Unlimited</span>
              </>
            ) : (
              <>
                <RefreshCw size={12} className="text-slate-500" />
                <span>{item.totalRevision}x Revisi</span>
              </>
            )}
          </div>
        </div>

        <div className={`h-px w-full bg-gradient-to-r ${colors.divider}`} />

        <ul className="space-y-2">
          {item.deliverables.slice(0, 3).map((d, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-slate-300 line-clamp-1"
            >
              <Check size={13} className={`${colors.check} mt-0.5 shrink-0`} />
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={() => openOrderModal(item)}
          className={`w-full py-3 rounded-xl bg-gradient-to-r ${colors.btn} text-sm font-bold flex items-center justify-center gap-2 shadow-lg !text-white cursor-pointer`}
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
          <ShoppingCart size={14} />
          Order Sekarang
        </button>
      </div>
    </div>
  );
};

const PricelistPreview = () => {
  const { openOrderModal } = useAppStore();
  const previewItems = useMemo(() => {
    return [...pricelistData]
      .sort((a, b) => a.finalPrice - b.finalPrice)
      .slice(0, 4);
  }, []);

  return (
    <section className="py-10 px-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="blob w-96 h-96 bg-brand-500/10 -top-20 -right-20 opacity-40" />
      <div
        className="blob w-80 h-80 bg-neon/5 bottom-0 -left-20 opacity-30"
        style={{ animationDelay: "-4s" }}
      />

      <div className="max-w-[1400px] mx-auto md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-brand-500/20 text-[10px] text-brand-400 font-black uppercase tracking-widest mb-4">
              <Zap size={12} /> Special Offers
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
              Pilihan Layanan <span className="text-gradient">Terhemat</span>{" "}
              Untukmu
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mulai langkah branding-mu dengan paket yang paling affordable.
              Kualitas profesional, harga tetap bersahabat untuk UMKM & Personal
              Brand.
            </p>
          </div>

          <Link
            to="/pricelist"
            className="group inline-flex items-center gap-2 text-[var(--color-brand)] hover:text-[var(--color-text-title)] font-bold text-sm transition-colors"
          >
            Lihat Semua Layanan
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewItems.map((item, index) => (
            <div key={item.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <PreviewCard item={item} />
            </div>
          ))}
        </div>

        <div
          className="mt-10 overflow-hidden reveal"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="relative p-6 md:p-10 px-8 md:px-12 rounded-3xl md:rounded-4xl bg-brand-gradient overflow-hidden group">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-neon/10 transition-colors" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-[10px] text-brand-400 font-black uppercase tracking-widest mb-6">
                  <ShoppingCart size={12} /> Flexible Pricing
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight">
                  Punya Kebutuhan Khusus{" "}
                  <span className="text-gradient">Yang Tidak Ada</span> Di
                  Paket?
                </h2>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  Tenang, kami siap membantu! Kalau projectmu butuh penyesuaian
                  khusus atau ingin kolaborasi jangka panjang dengan budget
                  tertentu, ceritain aja dulu. Kami akan buatkan penawaran
                  spesial hanya untukmu.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 shrink-0">
                <button
                  onClick={() =>
                    openOrderModal({
                      serviceName: "Custom Package (Diskusi Khusus)",
                      category: "Other",
                      deliverables: [
                        "Kebutuhan khusus di luar paket standar",
                        "Kolaborasi strategis & jangka panjang",
                        "Penyesuaian budget & ekspektasi",
                      ],
                    })
                  }
                  className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-500 text-white font-black text-lg transition-all duration-300 shadow-[0_0_20px_rgba(255,119,57,0.3)] hover:shadow-[0_0_40px_rgba(255,119,57,0.4)] hover:scale-105 active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingCart
                    size={22}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  Diskusi Paket Custom
                </button>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                  Respon Cepat via WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricelistPreview;
