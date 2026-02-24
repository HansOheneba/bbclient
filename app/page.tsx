import GlassHeader from "@/components/layout/header";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.12),transparent_55%)]" />

      <GlassHeader />
      <div className="h-10" />

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-24 text-center bg-black">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Boba, Iced Tea &{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Shawarma
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto">
              Handcrafted drinks and loaded shawarma, made fresh daily with
              premium ingredients. Your bliss is just a tap away.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/order"
                className="rounded-full bg-white px-8 py-3 text-sm font-bold text-[#07040b] shadow-lg hover:bg-white/90 transition"
              >
                Order Now
              </Link>
              <Link
                href="/#story"
                className="rounded-full border border-white/20 bg-white/[0.06] backdrop-blur px-8 py-3 text-sm font-bold text-white/85 hover:bg-white/[0.10] transition"
              >
                Our Story
              </Link>
            </div>
          </div>
        </section>

        {/* Features / highlights */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                emoji: "🧋",
                title: "Premium Boba",
                desc: "Milk teas, specials & milkshakes crafted with real ingredients.",
              },
              {
                emoji: "🧊",
                title: "Refreshing Iced Tea",
                desc: "Fruity, fizzy & spiced — served ice cold, always fresh.",
              },
              {
                emoji: "🌯",
                title: "Loaded Shawarma",
                desc: "Chicken, beef or mixed — wrapped with fresh veg & sauce.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 text-center space-y-3"
              >
                <span className="text-4xl">{f.emoji}</span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Hours */}
        <section className="mx-auto max-w-2xl px-6 pb-24 text-center space-y-4">
          <h2 className="text-2xl font-bold">Opening Hours</h2>
          <div className="inline-flex flex-col gap-2 text-white/70 text-sm">
            <p>Tuesday – Saturday: 2pm – 9:30pm</p>
            <p>Sunday: 3pm – 9pm</p>
            <p>Monday: Closed</p>
          </div>
          <p className="text-xs text-white/40">
            📍 Abura Taxi Station &bull; 📞 0536440126
          </p>
        </section>
      </main>
    </div>
  );
}
