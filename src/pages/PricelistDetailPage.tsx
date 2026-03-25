import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  ImageOff,
  Search,
  Zap,
  Clock,
  Star,
  MessageSquare,
  Wallet,
  Palette,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../utils/supabase";
import { PriceCard, PriceItem } from "./PricelistPage";
import AnimatedPage from "../ui/AnimatedPage";
import LazyImage from "../ui/LazyImage";
import Lightbox from "../ui/Lightbox";
import { resolveImageUrl } from "../utils/imageResolver";
import { PortfolioItem } from "../types";
import PortfolioCard from "../components/PortfolioCard";

const PricelistDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pricelist, setPricelist] = useState<PriceItem | null>(null);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Pricelist by slug
        const { data: priceData, error: priceError } = await supabase
          .from("pricelists")
          .select("*")
          .eq("slug", slug)
          .single();

        if (priceError) throw new Error("Pricelist not found");

        const mappedPricelist: PriceItem = {
          id: priceData.slug || priceData.servicename,
          category: priceData.category,
          serviceName: priceData.servicename,
          description: priceData.description,
          retailPrice: Number(priceData.retailprice ?? 0),
          finalPrice: Number(priceData.finalprice ?? 0),
          duration: Number(priceData.duration ?? 1),
          isRevisionUnlimited: Boolean(priceData.isrevisionunlimited),
          totalRevision: Number(priceData.totalrevision ?? 0),
          deliverables: priceData.deliverables || [],
          isShowToCustomer: Boolean(priceData.is_show_to_customer ?? false),
        };

        setPricelist(mappedPricelist);

        // 2. Fetch Portfolios linked to this pricelist
        const { data: portData, error: portError } = await supabase
          .from("portfolios")
          .select("*")
          .eq("pricelist_id", priceData.id)
          .order("order_index", { ascending: true });

        if (portError) throw portError;

        const mappedPortfolios: PortfolioItem[] = (portData || []).map(
          (row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            tags: row.tags || [],
            imgAlt: row.imgalt || "",
            linkUrl: row.linkurl || "",
            image: row.image || null,
            role: row.role || "",
            tools: row.tools || [],
            order_index: row.order_index,
          }),
        );

        setPortfolios(mappedPortfolios);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !pricelist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-xl w-full">
          <p className="text-red-400 font-bold mb-2">
            Gagal memuat detail paket
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {error || "Paket tidak ditemukan"}
          </p>
          <Link
            to="/pricelist"
            className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Kembali ke Pricelist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage>
      <Helmet>
        <title>{pricelist.serviceName} | Pricelist Detail</title>
        <meta name="description" content={pricelist.description} />
      </Helmet>

      {/* Top Section: Breadcrumb & Main Grid */}
      <div className="pt-24 md:pt-16 pb-10 px-4 md:px-6 max-w-[1400px] mx-auto">
        <Link
          to="/pricelist"
          className="inline-flex items-center gap-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-brand-400 transition-all duration-300 mb-6 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium text-[12px]">Back to Pricelist</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: PriceCard & Guarantee */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky lg:top-20 space-y-4">
              <div className="reveal visible">
                <PriceCard item={pricelist} isLink={false} />
              </div>

              {/* Guarantee Card - Compact */}
              <div
                className="reveal visible"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="glass rounded-2xl p-4 bg-brand-gradient">
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src="/img/guarantee-icon.png"
                        alt="Guarantee"
                        className="w-5 h-5 object-contain"
                      />
                      <h3 className="text-[12px] font-black text-white uppercase tracking-widest">
                        Gous Guarantee
                      </h3>
                    </div>
                    <p className="text-[10px] leading-relaxed hidden lg:block opacity-60">
                      Jaminan desain orisinil & layanan kualitas premium.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 hidden lg:grid">
                    {[
                      {
                        icon: Zap,
                        title: "Original Design",
                      },
                      {
                        icon: Clock,
                        title: "On-Time",
                      },
                      {
                        icon: Star,
                        title: "High Quality",
                      },
                      {
                        icon: MessageSquare,
                        title: "Expert Support",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-1">
                        <item.icon
                          size={12}
                          className="text-brand-400 shrink-0"
                        />
                        <p className="text-white text-[9px] font-black uppercase tracking-wider">
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                        Trusted by 500+ Clients
                      </p>
                      <div className="flex -space-x-1.5 mt-1">
                        {[1, 2, 3].map((n) => (
                          <img
                            key={n}
                            src={`/img/clients/testi-${n}.png`}
                            alt={`Testimonial ${n}`}
                            className="w-5 h-5 rounded-full border border-[var(--color-bg)] bg-slate-800 object-cover"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 uppercase italic">
                      <Star
                        size={10}
                        className="text-yellow-500 fill-current"
                      />
                      <span className="text-[10px] font-black text-white leading-none">
                        4.9
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Portfolio Masonry */}
          <section className="lg:col-span-8">
            <div className="reveal section-header-left border-l-2 border-brand-500/20 pl-6 py-2 mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 title-gradient-line">
                Recent Works
              </h2>
              <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                Contoh hasil pengerjaan untuk paket {pricelist.serviceName}.
              </p>
            </div>

            {portfolios.length > 0 ? (
              <div className="columns-2 md:columns-3 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
                {portfolios.map((item, index) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={setLightboxIndex}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center glass rounded-2xl border border-dashed border-white/10">
                <p className="text-slate-500 font-medium">
                  Belum ada portofolio untuk paket ini.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Design Process Section - Full Width Redesign */}
      <section className="py-16 md:py-20 px-4 reveal visible bg-brand-gradient relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 blur-[150px] -z-10 pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-12">
          <div className="section-header-left mb-16 reveal border-b border-white/5 pb-8">
            <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white title-gradient-line">
              Cara Order & Alur Kerja
            </h2>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed desc-creative">
              Kami menggunakan workflow yang teruji untuk memastikan ide
              cemerlang Anda terwujud dengan sempurna.
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-12 relative z-10">
              {[
                {
                  icon: MessageSquare,
                  title: "Briefing",
                  desc: "Konsultasi visi & kebutuhan desain Anda.",
                },
                {
                  icon: Wallet,
                  title: "Payment",
                  desc: "DP 50% untuk masuk antrean pengerjaan.",
                },
                {
                  icon: Palette,
                  title: "Design",
                  desc: "Proses desain sesuai brief & deadline.",
                },
                {
                  icon: RefreshCcw,
                  title: "Revision",
                  desc: "Penyesuaian hingga desain terasa pas.",
                },
                {
                  icon: CheckCircle2,
                  title: "Final Delivery",
                  desc: "Pelunasan & pengiriman file master lengkap.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`group relative ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  {/* Step Number Background */}
                  <div className="absolute -top-10 -left-6 text-8xl font-black text-white/[0.03] select-none group-hover:text-brand-500/[0.05] transition-colors pointer-events-none italic">
                    0{i + 1}
                  </div>

                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl glass neon-border flex items-center justify-center mb-8 group-hover:bg-brand-500/10 group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(255,119,57,0.1)]">
                      <step.icon
                        size={28}
                        className="text-brand-500 group-hover:scale-110 transition-transform"
                      />
                    </div>

                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 flex items-center gap-3">
                      <span className="w-6 h-px bg-brand-500/30 hidden lg:block"></span>
                      {step.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Full Width Style */}
      <section className="py-10 md:py-12 px-4 reveal visible">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 title-bracketed">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Beberapa hal yang sering ditanyakan mengenai layanan & proses
              pengerjaan di Gous Studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto px-4">
            {[
              {
                q: "Berapa lama proses pengerjaannya?",
                a: `Tergantung kompleksitas, rata-rata pengerjaan adalah ${pricelist.duration} hari kerja setelah brief dan DP diterima.`,
              },
              {
                q: "Apakah saya mendapatkan file master?",
                a: "Ya, Anda akan mendapatkan file master (AI/PSD/PDF) setelah proses pelunasan selesai.",
              },
              {
                q: "Bagaimana jika saya butuh revisi lebih?",
                a: pricelist.isRevisionUnlimited
                  ? "Paket ini sudah termasuk revisi tanpa batas hingga Anda puas."
                  : `Paket ini mencakup ${pricelist.totalRevision}x revisi. Revisi tambahan dapat dikenakan biaya ekstra.`,
              },
              {
                q: "Apakah desain ini orisinil?",
                a: "Tentu. Kami menjamin semua desain dibuat dari nol (custom) sesuai dengan karakter brand Anda.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="glass neon-border rounded-2xl p-6 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex gap-4">
                  <span className="text-brand-500 font-black text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                    Q
                  </span>
                  <div>
                    <h3 className="text-white text-base font-bold uppercase tracking-tight mb-3">
                      {faq.q}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed border-l border-white/5 pl-4">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          items={portfolios as any}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(dir) =>
            setLightboxIndex((prev) => {
              if (prev === null) return 0;
              return (prev + dir + portfolios.length) % portfolios.length;
            })
          }
        />
      )}
    </AnimatedPage>
  );
};

export default PricelistDetailPage;
