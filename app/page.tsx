"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star, MapPin, Clock, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import GlassHeader from "@/components/layout/header";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 28, filter: "blur(6px)" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className="text-[10px] font-extrabold tracking-[0.4em] uppercase mb-3"
      style={{ color: light ? "rgba(255,255,255,0.45)" : "#b94888" }}
    >
      {children}
    </p>
  );
}

/* ─── Best Sellers Carousel ──────────────────────────────────────────────── */
function BestSellersCarousel() {
  const [paused, setPaused] = React.useState(false);
  // Triplicate so the loop is seamless regardless of screen width
  const items = [...bestSellers, ...bestSellers, ...bestSellers];

  return (
    <>
      <style>{`
        @keyframes bb-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
        .bb-marquee-track {
          animation: bb-marquee 32s linear infinite;
        }
        .bb-marquee-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      <div className="overflow-hidden">
        <div
          className={`bb-marquee-track flex gap-4${paused ? " paused" : ""}`}
          style={{ width: "max-content" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {items.map((item, i) => (
            <Link
              key={`${item.name}-${i}`}
              href="/order"
              className="group shrink-0 w-[320px] sm:w-[380px] rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] hover:border-[#b94888]/30 transition-all duration-300"
            >
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: "rgba(185,72,136,0.18)" }}
                />
                <div
                  className="absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-white"
                  style={{
                    background: `${item.tagColor}30`,
                    border: `1px solid ${item.tagColor}55`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {item.tag}
                </div>
              </div>
              <div className="p-5 space-y-1.5">
                <p className="font-bold text-base group-hover:text-[#cc94b4] transition-colors">{item.name}</p>
                <p className="text-[12px] text-white/40 tracking-wide">{item.sub}</p>
                <p
                  className="text-[11px] font-bold tracking-[0.18em] uppercase flex items-center gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: item.tagColor }}
                >
                  Order Now <ArrowRight size={11} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const bestSellers = [
  {
    name: "Classic Milk Tea",
    tag: "#1 Most Ordered",
    tagColor: "#b94888",
    sub: "Rich · Creamy · Your Way",
    img: "https://i.pinimg.com/736x/ae/64/32/ae64320d38a6526f96f65c5a38c95bed.jpg",
  },
  {
    name: "HQ Special",
    tag: "House Exclusive",
    tagColor: "#ff980a",
    sub: "Only at Bubble Bliss",
    img: "https://i.pinimg.com/736x/26/4d/f3/264df3ae95c9b4fe17266669101ce48b.jpg",
  },
  {
    name: "Loaded Shawarma",
    tag: "Customer Favourite",
    tagColor: "#cc94b4",
    sub: "Chicken · Beef · Mixed",
    img: "https://i.pinimg.com/736x/c4/10/06/c41006049b919e5dbbdbb2e972839e5f.jpg",
  },
  {
    name: "Brown Sugar Boba",
    tag: "Trending",
    tagColor: "#ff980a",
    sub: "Tiger Stripes · Real Pearls",
    img: "https://i.pinimg.com/736x/ae/64/32/ae64320d38a6526f96f65c5a38c95bed.jpg",
  },
  {
    name: "Strawberry Iced Tea",
    tag: "Fan Pick",
    tagColor: "#b94888",
    sub: "Fruity · Light · Refreshing",
    img: "https://i.pinimg.com/736x/26/4d/f3/264df3ae95c9b4fe17266669101ce48b.jpg",
  },
  {
    name: "Chicken Shawarma Wrap",
    tag: "Best Value",
    tagColor: "#cc94b4",
    sub: "Grilled · Sauced · Fresh",
    img: "https://i.pinimg.com/736x/c4/10/06/c41006049b919e5dbbdbb2e972839e5f.jpg",
  },
];

const promises = [
  { label: "Mixed to Order", detail: "Every drink assembled when you order it — no batch brew." },
  { label: "Real Tea Bases", detail: "Actual tea leaves, not powder concentrate." },
  { label: "Custom Sweetness", detail: "0 % to 100 % — you choose, we nail it." },
  { label: "Fresh-Rolled Wraps", detail: "No pre-rolled shawarma sitting in a tray." },
];

const categories = [
  { key: "milk-tea",   label: "Milk Tea",    img: "https://i.pinimg.com/736x/ae/64/32/ae64320d38a6526f96f65c5a38c95bed.jpg" },
  { key: "hq-special", label: "HQ Special",  img: "https://i.pinimg.com/736x/26/4d/f3/264df3ae95c9b4fe17266669101ce48b.jpg" },
  { key: "iced-tea",   label: "Iced Tea",    img: "/boba.jpg" },
  { key: "milkshakes", label: "Milkshakes",  img: "/boba.jpg" },
  { key: "shawarma",   label: "Shawarma",    img: "https://i.pinimg.com/736x/c4/10/06/c41006049b919e5dbbdbb2e972839e5f.jpg" },
];

const testimonials = [
  {
    name: "Abena K.",
    rating: 5,
    text: "The HQ Special is genuinely something else. I've tried boba elsewhere and nothing comes close. Bubble Bliss is in a league of its own.",
  },
  {
    name: "Kwame A.",
    rating: 5,
    text: "Ordered the shawarma on a whim and it became a weekly habit. The fact that I can order online now is dangerous for my wallet.",
  },
  {
    name: "Efua M.",
    rating: 5,
    text: "Best milk tea in Cape Coast, period. I asked for 50% sweetness and it tasted exactly like it. Small thing, massive deal.",
  },
  {
    name: "Kofi B.",
    rating: 5,
    text: "The milk tea boba pearls are perfect — not too soft, not too chewy. Customer service is great every single time.",
  },
  {
    name: "Adwoa S.",
    rating: 5,
    text: "I was in and out in under 10 minutes with exactly what I ordered. For fresh food, that's impressive. Will be back.",
  },
];

/* ─── Testimonial carousel ───────────────────────────────────────────────── */
function TestimonialMarquee() {
  const [paused, setPaused] = React.useState(false);
  const items = [...testimonials, ...testimonials, ...testimonials];
  return (
    <>
      <style>{`
        @keyframes bb-tmarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
        .bb-tmarquee-track { animation: bb-tmarquee 40s linear infinite; }
        .bb-tmarquee-track.paused { animation-play-state: paused; }
      `}</style>
      <div className="overflow-hidden">
        <div
          className={`bb-tmarquee-track flex gap-5${paused ? " paused" : ""}`}
          style={{ width: "max-content" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {items.map(({ name, rating, text }, i) => {
            const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2);
            return (
              <div
                key={`${name}-${i}`}
                className="shrink-0 w-[88vw] sm:w-[480px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 flex flex-col gap-5"
              >
                <div className="flex gap-1">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} size={14} fill="#ff980a" stroke="none" />
                  ))}
                </div>
                <p className="text-[16px] sm:text-[18px] text-white/70 leading-relaxed italic flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-4 border-t border-white/[0.07] pt-5">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: "#b94888" }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-white">{name}</p>
                    <p className="text-xs text-white/30 tracking-wide">Verified Customer</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">

      <GlassHeader />

      {/* ════════════════════════════════════════════
          HERO — full bleed image + centred headline
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full" style={{ minHeight: "95vh" }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://i.pinimg.com/736x/26/4d/f3/264df3ae95c9b4fe17266669101ce48b.jpg"
            alt="Bubble Bliss signature drinks"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "95vh" }}>
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl space-y-6"
          >
            <p className="text-[10px] font-extrabold tracking-[0.5em] text-[#cc94b4] uppercase">
              Cape Coast &nbsp;·&nbsp; Abura Taxi Station
            </p>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[0.98]">
              More Than<br />
              <span className="italic" style={{ color: "#b94888" }}>
                Just Boba.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/55 max-w-md mx-auto leading-relaxed">
              Premium boba, iced teas, milkshakes and loaded shawarma —
              every order made fresh, every time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/order"
                className="inline-flex items-center gap-2 rounded-full px-9 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-200 hover:scale-105"
                style={{ background: "#b94888" }}
              >
                Order Now <ArrowRight size={15} />
              </Link>
              <Link
                href="/story"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.06] backdrop-blur px-9 py-3.5 text-sm font-bold text-white/75 hover:bg-white/[0.10] hover:text-white transition"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="absolute bottom-10 flex flex-col items-center gap-2 text-white/20"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <span className="text-[9px] tracking-[0.4em] uppercase">Scroll</span>
            <div className="h-7 w-px bg-white/15" />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BEST SELLERS CAROUSEL
      ════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 overflow-hidden" style={{ background: "#130010" }}>
        <FadeUp className="text-center mb-14 px-6">
          <SectionLabel>BEST SELLERS</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
            The ones they keep<br />
            <span className="text-white/35 font-normal text-3xl sm:text-4xl">coming back for.</span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.15}>
          <BestSellersCarousel />
        </FadeUp>
        <FadeUp delay={0.3} className="text-center mt-12">
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3 text-sm font-bold text-white/60 hover:bg-white/[0.08] hover:text-white transition"
          >
            View Full Menu <ArrowRight size={13} />
          </Link>
        </FadeUp>
      </section>

      {/* ════════════════════════════════════════════
          PROMISE STRIP — 4 quality pillars
      ════════════════════════════════════════════ */}
      <FadeUp>
        <section
          className="relative z-10 py-16 px-6 overflow-hidden"
          style={{ background: "#000000" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.04]" />
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] px-0">
            {promises.map(({ label, detail }, i) => (
              <div key={label} className="space-y-2 text-center sm:text-left px-8 py-6 sm:py-0">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="w-1.5 h-6 rounded-full shrink-0" style={{
                    background: i % 2 === 0 ? "#b94888" : "#7c3070"
                  }} />
                  <p className="text-sm font-bold text-white">{label}</p>
                </div>
                <p className="text-[13px] text-white/40 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      {/* ════════════════════════════════════════════
          SWEETEN YOUR DAY — customisation split
      ════════════════════════════════════════════ */}
      <section className="relative z-10 py-28" style={{ background: "#130010" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          <FadeUp className="order-2 lg:order-1 space-y-7 px-8 sm:px-16 py-16 lg:py-0 flex flex-col justify-center">
            <div>
              <SectionLabel>MADE YOUR WAY</SectionLabel>
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                Built around you,{" "}
                <span className="italic" style={{ color: "#b94888" }}>
                  blended to order.
                </span>
              </h2>
            </div>
            <p className="text-white/50 text-[15px] leading-relaxed">
              We know everyone&apos;s taste is different. That&apos;s why every order
              at Bubble Bliss is built around you — sweetness level, spice level,
              toppings, special requests. You call it. We make it.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Sugar Level", "0% to 100%"],
                ["Spice Level", "Mild to hot"],
                ["Free Topping", "One on us"],
                ["Special Notes", "Any request"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/[0.07] p-4 space-y-1 hover:border-[#b94888]/20 transition-colors">
                  <p className="text-xs font-bold text-white/85">{k}</p>
                  <p
                    className="text-xs font-bold"
                    style={{ color: "#b94888" }}
                  >{v}</p>
                </div>
              ))}
            </div>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white transition hover:scale-105"
              style={{ background: "#b94888" }}
            >
              Build Your Order <ArrowRight size={14} />
            </Link>
          </FadeUp>
          <FadeUp delay={0.15} className="order-1 lg:order-2">
            <div className="relative overflow-hidden" style={{ minHeight: "560px" }}>
              <Image
                src="https://i.pinimg.com/736x/ae/64/32/ae64320d38a6526f96f65c5a38c95bed.jpg"
                alt="Custom boba order"
                fill className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              {/* Floating pill */}
              <div className="absolute top-5 right-5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md px-4 py-2">
                <p className="text-[10px] tracking-[0.22em] font-bold uppercase" style={{ color: "#ff980a" }}>
                  Your Order · Your Rules
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5 CATEGORIES — full menu overview
      ════════════════════════════════════════════ */}
      <section className="relative z-10 py-24" style={{ background: "#000000" }}>
        <FadeUp className="text-center mb-12 px-6">
          <SectionLabel>THE FULL MENU</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-bold">
            Five categories.<br />
            <span className="text-white/35 font-normal text-2xl sm:text-3xl">Zero boring options.</span>
          </h2>
        </FadeUp>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0">
          {categories.map(({ key, label, img }, i) => (
            <FadeUp key={key} delay={i * 0.07}>
              <Link href="/order" className="group relative block overflow-hidden" style={{ minHeight: "420px" }}>
                <Image
                  src={img} alt={label} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 bg-black/55 transition-opacity duration-300" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: "rgba(185,72,136,0.22)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-1">
                  <p className="text-lg font-bold text-white leading-tight group-hover:text-[#cc94b4] transition-colors">{label}</p>
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 text-white/40 group-hover:text-[#b94888] transition-colors">
                    Explore <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.38} className="text-center mt-12 px-6">
          <Link
            href="/order"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3 text-sm font-bold text-white/60 hover:bg-white/[0.08] hover:text-white transition"
          >
            Order Now <ArrowRight size={13} />
          </Link>
        </FadeUp>
      </section>

      {/* ════════════════════════════════════════════
          DIPTYCH — drinks + shawarma full bleed
      ════════════════════════════════════════════ */}
      <FadeUp>
        <section className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2" style={{ minHeight: "520px" }}>
          <div className="relative overflow-hidden" style={{ minHeight: "520px" }}>
            <Image
              src="https://i.pinimg.com/736x/ae/64/32/ae64320d38a6526f96f65c5a38c95bed.jpg"
              alt="Bubble Bliss drinks" fill className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/55" />
          </div>
          <div className="relative overflow-hidden" style={{ minHeight: "520px" }}>
            <Image
              src="https://i.pinimg.com/736x/c4/10/06/c41006049b919e5dbbdbb2e972839e5f.jpg"
              alt="Bubble Bliss shawarma" fill
              className="object-cover hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute bottom-8 left-8 right-8 space-y-2">
              <p className="text-[9px] tracking-[0.4em] font-bold uppercase" style={{ color: "#ff980a" }}>KITCHEN MENU</p>
              <h3 className="text-2xl font-bold">Loaded Shawarma</h3>
              <p className="text-sm text-white/45 leading-relaxed max-w-xs">Chicken, beef or mixed — rolled fresh with crisp veg every time.</p>
              <Link href="/order" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition mt-1">
                Order food <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ════════════════════════════════════════════
          TESTIMONIALS — banded section
      ════════════════════════════════════════════ */}
      <section
        className="relative z-10 py-28 overflow-hidden"
        style={{ background: "#130010" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.03]" />
        <FadeUp className="text-center mb-14 relative px-6">
          <SectionLabel light>SOCIAL PROOF</SectionLabel>
          <h2 className="text-4xl sm:text-6xl font-bold leading-tight">
            What our neighbours<br className="hidden sm:block" /> are saying.
          </h2>
          <p className="mt-5 text-white/35 text-[15px] max-w-md mx-auto leading-relaxed">
            Real orders. Real people. Real opinions from Cape Coast.
          </p>
        </FadeUp>
        <FadeUp delay={0.15}>
          <TestimonialMarquee />
        </FadeUp>
      </section>

      {/* ════════════════════════════════════════════
          UGC / SOCIAL CALLOUT
      ════════════════════════════════════════════ */}
      <FadeUp>
          <section className="relative z-10 overflow-hidden" style={{ background: "#000000" }}>
          <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.04]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 items-stretch">
            {/* Left — text */}
            <div className="flex flex-col justify-center gap-6 px-10 sm:px-20 py-24">
              <SectionLabel>SHARE THE BLISS</SectionLabel>
              <h2 className="text-4xl sm:text-6xl font-bold leading-tight">
                Show us<br />your order.
              </h2>
              <p className="text-white/45 text-[16px] leading-relaxed max-w-sm">
                Post your Bubble Bliss moment on Instagram or TikTok and tag us with{" "}
                <span className="font-bold" style={{ color: "#b94888" }}>
                  #BubbleBlissCafe
                </span>
                {" "}— we feature our favourites every week.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white/60">
                  Instagram
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white/60">
                  TikTok
                </span>
              </div>
            </div>
            {/* Right — tag panel */}
            <div
              className="relative flex items-center justify-center py-24 lg:py-0"
              style={{ minHeight: "420px", background: "rgba(185,72,136,0.12)", borderLeft: "1px solid rgba(185,72,136,0.15)" }}
            >
              <div className="text-center space-y-3 px-8">
                <p
                  className="text-6xl sm:text-8xl font-black tracking-tight"
                  style={{ color: "#b94888" }}
                >
                  #BubbleBlissCafe
                </p>
                <p className="text-white/30 text-sm tracking-[0.2em] uppercase">Tag us to be featured</p>
              </div>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ════════════════════════════════════════════
          HOURS + LOCATION — 2-card row
      ════════════════════════════════════════════ */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-2" style={{ background: "#130010" }}>
        {/* HOURS */}
        <FadeUp>
          <div
            className="flex flex-col justify-center gap-8 px-10 sm:px-20 py-24 border-b lg:border-b-0 lg:border-r border-white/[0.06]"
            style={{ minHeight: "460px" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(185,72,136,0.15)", border: "1px solid rgba(185,72,136,0.25)" }}
              >
                <Clock size={20} style={{ color: "#b94888" }} />
              </div>
              <div>
                <SectionLabel>HOURS</SectionLabel>
                <p className="font-bold text-2xl -mt-1">When we&apos;re open</p>
              </div>
            </div>
            <div className="space-y-5">
              {[
                { day: "Tue – Sat", time: "2:00 pm – 9:30 pm" },
                { day: "Sunday",    time: "3:00 pm – 9:00 pm" },
                { day: "Monday",    time: "Closed" },
              ].map(({ day, time }) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-white/45 text-base">{day}</span>
                  <span
                    className={`text-base font-semibold ${
                      time === "Closed" ? "text-white/20" : "text-white/90"
                    }`}
                    style={time !== "Closed" ? { color: "#b94888" } : {}}
                  >
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
        {/* FIND US */}
        <FadeUp delay={0.1}>
          <div
            className="flex flex-col justify-center gap-8 px-10 sm:px-20 py-24"
            style={{ minHeight: "460px" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,152,10,0.15)", border: "1px solid rgba(255,152,10,0.25)" }}
              >
                <MapPin size={20} style={{ color: "#b94888" }} />
              </div>
              <div>
                <SectionLabel>FIND US</SectionLabel>
                <p className="font-bold text-2xl -mt-1">Where we are</p>
              </div>
            </div>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              We&apos;re at{" "}
              <span className="text-white font-semibold">Abura Taxi Station</span>,
              Cape Coast. Walk in, or order online from anywhere.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone size={15} style={{ color: "#ff980a" }} />
                <a
                  href="tel:+233536440126"
                  className="text-base text-white/60 hover:text-white transition font-medium"
                >
                  +233 53 644 0126
                </a>
              </div>
              <Link
                href="/order"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:scale-105"
                style={{ background: "#b94888" }}
              >
                Order online <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════════════════════════════════
          NEWSLETTER
      ════════════════════════════════════════════ */}
      <FadeUp>
        <section
          className="relative z-10 py-20 px-6 overflow-hidden"
          style={{ background: "#000000" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.04]" />
          <div className="relative mx-auto max-w-xl text-center space-y-5">
            <SectionLabel light>STAY IN THE LOOP</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold">
              New drinks. New specials.<br />First access.
            </h2>
            <p className="text-white/35 text-sm">
              Drop your email — we&apos;ll let you know when something new drops before anyone else.
            </p>
            {submitted ? (
              <p className="text-sm font-bold" style={{ color: "#b94888" }}>
                You&apos;re on the list. We&apos;ll be in touch.
              </p>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubmitted(true); }}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <input
                  type="email" required placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 w-full rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#b94888]/50 transition"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full px-6 py-3 text-sm font-bold text-white transition hover:scale-105"
                  style={{ background: "#b94888" }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>
      </FadeUp>

    </div>
  );
}


