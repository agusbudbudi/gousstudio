import React from "react";

const Process = () => {
  const steps = [
    {
      emoji: "🔍",
      title: "1. Research",
      desc: "Kami mempelajari kompetitor, target audiens, dan nilai unik brand Anda.",
    },
    {
      emoji: "💡",
      title: "2. Concepting",
      desc: "Eksplorasi ide kreatif dan pembuatan sketsa konsep awal yang sesuai visi.",
    },
    {
      emoji: "🎨",
      title: "3. Refinement",
      desc: "Mengembangkan konsep terpilih menjadi desain final yang matang dan estetis.",
    },
    {
      emoji: "🚀",
      title: "4. Delivery",
      desc: "Penyerahan file asset lengkap dengan dokumentasi pendukung berkualitas tinggi.",
    },
  ];

  return (
    <section
      id="process"
      className="pt-20 pb-32 px-4 relative overflow-hidden bg-brand-gradient"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="section-header-left mb-16 reveal border-b border-white/5 pb-8">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white title-gradient-line">
            Our Creative Process
          </h2>
          <p className="text-slate-400 max-w-xl desc-creative">
            Kami menggunakan workflow yang teruji untuk memastikan ide cemerlang
            Anda terwujud dengan sempurna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 reveal">
          {steps.map((step, index) => (
            <div key={index} className="process-step group">
              <div className="mb-6 w-14 h-14 rounded-2xl glass neon-border flex items-center justify-center text-2xl group-hover:bg-brand-500/20 group-hover:scale-110 transition-all duration-500">
                {step.emoji}
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
