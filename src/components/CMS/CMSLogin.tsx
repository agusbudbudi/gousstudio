import React, { FormEvent, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { EASE, Eyebrow, buttonClass, BrandLogo } from "../landing/primitives";

interface CMSLoginProps {
  onSuccess: () => void;
}

const DESK_ITEMS = ["Portfolio", "Order", "Klien", "Pricelist", "Voucher"];

// CMS sign-in on the brand shell (docs/DESIGN.md §2): paper + ink, editorial type, violet-600 pill CTA.
const CMSLogin: React.FC<CMSLoginProps> = ({ onSuccess }) => {
  const reduceMotion = useReducedMotion();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/cms/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setError("");
        onSuccess();
      } else {
        setError(data.message || "Password tidak valid. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setSubmitting(false);
    }
  };

  const enter = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: EASE, delay },
        };

  return (
    <div className="gs min-h-[100dvh] grid lg:grid-cols-[1.1fr_1fr]">
      {/* Left: ink editorial panel (desktop only) */}
      <aside className="gs-dark gs-grain relative hidden lg:flex flex-col justify-between bg-ink text-paper px-12 py-12 xl:px-16 overflow-hidden">
        <Link to="/" aria-label="Gous Studio — beranda" className="self-start">
          <BrandLogo onDark />
        </Link>

        <motion.div {...enter(0.05)}>
          <Eyebrow className="text-paper/60">
            Studio Desk
          </Eyebrow>
          <h2 className="gs-display mt-6 font-extrabold text-[clamp(2.75rem,4.6vw,4.5rem)]">
            Semua karya,
            <br />
            satu <span className="text-violet-400">meja</span>.
          </h2>
          <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-paper/60">
            Kelola portfolio, order, dan klien Gous Studio dari satu tempat.
          </p>
        </motion.div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-paper/10 pt-6">
          {DESK_ITEMS.map((item) => (
            <li key={item} className="gs-label text-paper/45">
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Right: form on paper */}
      <main className="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
        <Link to="/" aria-label="Gous Studio — beranda" className="self-start lg:hidden">
          <BrandLogo />
        </Link>

        <div className="flex flex-1 items-center justify-center py-12">
          <motion.div {...enter(0.12)} className="w-full max-w-[400px]">
            <Eyebrow className="text-muted">CMS Login</Eyebrow>
            <h1 className="gs-display mt-5 font-extrabold text-ink text-[clamp(2.5rem,6vw,3.5rem)]">
              Masuk.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Masukkan password admin untuk membuka dashboard.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
              <div>
                <label htmlFor="cms-password" className="gs-label block text-muted mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="cms-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "cms-password-error" : undefined}
                    autoFocus
                    className={`h-14 w-full rounded-[14px] border bg-white pl-5 pr-14 text-base text-ink placeholder:text-ink/25 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 ${
                      error
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-ink/15 hover:border-ink/30 focus:border-violet-600 focus:ring-violet-600/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-2 my-auto flex h-10 w-10 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {error && (
                    <motion.p
                      id="cms-password-error"
                      role="alert"
                      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="mt-2.5 flex items-start gap-2 text-sm text-rose-600"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={!password || submitting}
                className={`${buttonClass("primary", "lg")} w-full disabled:opacity-50 disabled:active:scale-100`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-[18px] w-[18px] motion-safe:animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-[3px]" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        <p className="gs-label text-ink/35">© {new Date().getFullYear()} Gous Studio · Akses khusus admin</p>
      </main>
    </div>
  );
};

export default CMSLogin;
