import React from "react";
import { Quote } from "lucide-react";

interface Testimonial {
  stars: number;
  text: string;
  author: string;
  role: string;
  avatar: string;
  gender: "male" | "female";
  delay: string;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      stars: 5,
      text: '"Gous Studio sangat profesional. Logo yang dihasilkan benar-benar merepresentasikan brand kami dengan sempurna. Prosesnya cepat dan komunikatif!"',
      author: "Budi Santoso",
      role: "Owner, Katzenesia",
      avatar: "/img/clients/testi-1.png",
      gender: "male",
      delay: "0s",
    },
    {
      stars: 5,
      text: '"Desain feed Instagram kami jauh lebih rapi dan engagement naik signifikan sejak dikelola Gous Studio. Highly recommended!"',
      author: "Sari Putri",
      role: "Marketing, SpeakGuru",
      avatar: "/img/clients/testi-2.png",
      gender: "female",
      delay: "0.1s",
    },
    {
      stars: 5,
      text: '"Penanganan project poster untuk event kami sangat luar biasa. Artistik dan tetap fungsional informasinya. Klien sangat puas!"',
      author: "Andi Wijaya",
      role: "Event Manager, Lakuna",
      avatar: "/img/clients/testi-3.png",
      gender: "male",
      delay: "0.2s",
    },
    {
      stars: 5,
      text: '"Banner e-commerce yang dibuat sangat konversi tinggi. Penjualan produk kami naik 40% setelah menggunakan desain dari Gous Studio!"',
      author: "Maya Sari",
      role: "E-commerce Manager, BeautyStore",
      avatar: "",
      gender: "female",
      delay: "0.3s",
    },
    {
      stars: 5,
      text: '"Management sosial media yang comprehensive. Dari content calendar sampai posting schedule, semua tertangani dengan baik. Terima kasih Gous!"',
      author: "Rizky Pratama",
      role: "CEO, TechStart Indonesia",
      avatar: "",
      gender: "male",
      delay: "0.4s",
    },
    {
      stars: 5,
      text: '"Desain poster untuk bootcamp ITB sangat mengagumkan. Peserta yang mendaftar meningkat drastis berkat visual yang menarik dan informatif."',
      author: "Dr. Ahmad Fauzi",
      role: "Program Director, ITB Bootcamp",
      avatar: "",
      gender: "male",
      delay: "0.5s",
    },
  ];

  const getAvatar = (testi: Testimonial) => {
    if (testi.avatar && testi.avatar.trim() !== "") return testi.avatar;
    return testi.gender === "female"
      ? "/img/avatar-female.png"
      : "/img/avatar-male.webp";
  };

  return (
    <section id="testimonials" className="py-10 px-3">
      <div className="max-w-[1400px] mx-auto md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 reveal gap-6">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 title-bracketed">
              Apa Kata Klien Kami
            </h2>
          </div>
          <p className="text-slate-400 max-w-sm text-sm italic border-l-2 border-brand-500 pl-4 py-1">
            "Kepercayaan klien adalah motivasi terbesar kami untuk terus
            berkarya dan memberikan hasil terbaik."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {testimonials.map((testi, index) => (
            <div
              key={index}
              className="p-7 rounded-2xl reveal group relative shadow-lg shadow-black/3"
              style={{ animationDelay: testi.delay }}
            >
              <div className="absolute top-5 right-6 text-white/5 group-hover:text-brand-500/10 transition-colors duration-700">
                <Quote size={48} className="rotate-12" />
              </div>
              <div className="flex gap-1 text-orange-400 mb-4 text-[16px]">
                <span>★★★★★</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4 relative z-10">
                {testi.text}
              </p>
              <div className="flex items-center gap-3 relative z-10 pt-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-slate-500/10">
                  <img
                    src={getAvatar(testi)}
                    alt={testi.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-bold tracking-tight">
                    {testi.author}
                  </p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    {testi.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
