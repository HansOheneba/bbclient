"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle2, Flame, Leaf, Zap, MapPin } from "lucide-react";
import GlassHeader from "@/components/layout/header";

/* ─── Fade-up animation wrapper ─────────────────────────────────────────── */
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
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section label ─────────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-extrabold tracking-[0.38em] text-[#b94888] uppercase mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/* ─── Timeline milestones ────────────────────────────────────────────────── */
const milestones = [
  {
    year: "2023",
    title: "The Idea Brews",
    desc: "Thomas Graham Wilberforce, frustrated with the lack of quality boba and good food in Cape Coast, sketches the first Bubble Bliss menu on a notepad. A dream of craft, community, and flavour takes shape.",
  },
  {
    year: "2024",
    title: "First Sips Served",
    desc: "The first round of signature boba and shawarma goes out — word spreads fast. A small but loyal following grows on the back of consistent quality and zero compromises on ingredients.",
  },
  {
    year: "2025",
    title: "A Home at Abura",
    desc: "Bubble Bliss finds its permanent home at Abura Taxi Station. The full menu launches — milk teas, iced teas, specials, and loaded shawarma — served fresh, every single day.",
  },
  {
    year: "2026",
    title: "Bliss Goes Online",
    desc: "bubbleblisscafe.com goes live with full online ordering. Cape Coast can now order their favourite drinks and wraps from anywhere — delivery, pickup, or dine-in.",
  },
];

/* ─── Core values ────────────────────────────────────────────────────────── */
const values = [
  {
    Icon: Flame,
    title: "Made to Order",
    desc: "Nothing is pre-mixed or sitting under a lamp. Every drink and every wrap is assembled the moment your order comes in.",
  },
  {
    Icon: Leaf,
    title: "Real Ingredients",
    desc: "We don't cut corners with syrups and powder. You can taste the difference in everything we make.",
  },
  {
    Icon: Zap,
    title: "Fast, Not Cheap",
    desc: "Speed and quality aren't opposites. We've built our kitchen so you never have to choose between the two.",
  },
  {
    Icon: MapPin,
    title: "Rooted in Cape Coast",
    desc: "This is a local business with real roots — not a franchise. Every order you place supports something built from the ground up.",
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function StoryPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Global ambient gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(185,72,136,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,152,10,0.08),transparent_55%)]" />
      </div>

      <GlassHeader
        activeHref="/story"
        navItems={[
          { label: "Home", href: "/" },
          { label: "Menu", href: "/order" },
          { label: "Our Story", href: "/story" },
        ]}
      />

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full" style={{ minHeight: "80vh" }}>
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://i.pinimg.com/736x/26/4d/f3/264df3ae95c9b4fe17266669101ce48b.jpg"
            alt="Bubble Bliss hero"
            fill
            className="object-cover object-center scale-[0.95]"
            priority
          />
          {/* Multi-layer gradient so text is always legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          {/* Brand colour wash */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(185,72,136,0.22),transparent_60%)]" />
        </div>

        {/* Hero copy */}
        <div
          className="relative flex flex-col items-center justify-center text-center px-6"
          style={{ minHeight: "80vh" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl space-y-5"
          >
            <p className="text-[10px] font-extrabold tracking-[0.44em] text-[#cc94b4] uppercase">
              THE STORY
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight">
              More Than{" "}
              <span
                className="italic"
                style={{
                  background:
                    "linear-gradient(135deg, #b94888 0%, #ff980a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                a Drink.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/65 max-w-lg mx-auto leading-relaxed">
              The vision behind the bliss. The obsession behind every cup.
            </p>
            <div className="pt-2">
              <Link
                href="/order"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #b94888 0%, #ff980a 100%)" }}
              >
                See the Menu
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            className="absolute bottom-10 flex flex-col items-center gap-2 text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOUNDER
      ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6" style={{ background: "#000000" }}>
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <FadeUp>
            <div className="space-y-6">
              <Label>WHO WE ARE</Label>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Hi, I'm Thomas.{" "}
                <span className="text-white/50 font-normal">
                  I built this because Cape Coast deserved better.
                </span>
              </h2>
              <p className="text-white/60 leading-relaxed text-[15px]">
                Thomas Graham Wilberforce didn't set out to open a cafe — he set out
                to solve a problem. Growing up in Cape Coast, he loved the idea of
                great drinks and great food, but couldn't find a place that took
                both seriously. So he started one.
              </p>
              <p className="text-white/60 leading-relaxed text-[15px]">
                Bubble Bliss Cafe is the result of years of taste-testing,
                recipe-refining, and a stubborn refusal to settle for "good enough."
                Every item on the menu exists because Thomas decided it was
                genuinely worth serving.
              </p>

              {/* Promises */}
              <ul className="space-y-3 pt-2">
                {[
                  "Every drink mixed fresh — never batch-brewed",
                  "Shawarma rolled to order, every single time",
                  "If it's not right, we make it right",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0"
                      style={{ color: "#b94888" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          {/* Visual panel */}
          <FadeUp delay={0.15}>
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="https://i.pinimg.com/736x/64/18/fb/6418fbb386606f49f05a9692908ebd1a.jpg"
                alt="Founder at Bubble Bliss"
                fill
                className="object-cover"
              />
              {/* Tint overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(185,72,136,0.18) 0%, rgba(255,152,10,0.10) 100%)",
                }}
              />
              {/* Quote chip */}
              <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 bg-black/50 backdrop-blur-md px-5 py-4">
                <p className="text-sm italic text-white/80 leading-relaxed">
                  "I wanted to create a place where every visit feels like the
                  first time you ever had something this good."
                </p>
                <p className="mt-2 text-[11px] tracking-[0.22em] text-[#b94888] uppercase font-bold">
                  — Thomas Graham Wilberforce, Founder
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CORE VALUES
      ════════════════════════════════════════════════════════ */}
      <Divider />
      <section className="relative z-10 py-28 px-6" style={{ background: "#130010" }}>
        <FadeUp className="text-center mb-14">
          <Label>WHAT WE STAND FOR</Label>
          <h2 className="text-3xl sm:text-4xl font-bold">Our Core Values</h2>
        </FadeUp>

        <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map(({ Icon, title, desc }, i) => (
            <FadeUp key={title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 space-y-4 hover:border-[#b94888]/25 hover:bg-white/[0.045] transition-all duration-300 group">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(185,72,136,0.18) 0%, rgba(255,152,10,0.10) 100%)",
                    border: "1px solid rgba(185,72,136,0.2)",
                  }}
                >
                  <Icon size={17} style={{ color: "#b94888" }} />
                </div>
                <h3 className="font-bold text-[15px] group-hover:text-[#cc94b4] transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TIMELINE
      ════════════════════════════════════════════════════════ */}
      <Divider />
      <section className="relative z-10 py-28 px-6" style={{ background: "#000000" }}>

        <FadeUp className="text-center mb-16">
          <Label>OUR JOURNEY</Label>
          <h2 className="text-3xl sm:text-4xl font-bold">The Bubble Bliss Story</h2>
        </FadeUp>

        <div className="mx-auto max-w-2xl relative">
          <div
            className="absolute left-[calc(50%-0.5px)] top-0 bottom-0 w-px"
            style={{
              background:
                "linear-gradient(to bottom, transparent, #b94888 15%, #ff980a 80%, transparent)",
            }}
          />

          <div className="space-y-0">
            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <FadeUp key={m.year} delay={i * 0.1}>
                  <div className="relative grid grid-cols-2 gap-x-8 items-start py-8">
                    {/* Left slot */}
                    <div className={`${isLeft ? "pr-8 text-right" : "col-start-2 pl-8 text-left"} space-y-1`}>
                      {isLeft ? (
                        <>
                          <p
                            className="text-2xl font-bold"
                            style={{ color: "#b94888" }}
                          >
                            {m.year}
                          </p>
                          <p className="font-semibold text-sm text-white">{m.title}</p>
                          <p className="text-sm text-white/45 leading-relaxed">{m.desc}</p>
                        </>
                      ) : (
                        <div />
                      )}
                    </div>

                    {/* Timeline dot */}
                    <div
                      className="absolute left-1/2 top-[2.15rem] -translate-x-1/2 z-10 w-3.5 h-3.5 rounded-full border-2 border-black"
                      style={{
                        background: i % 2 === 0 ? "#b94888" : "#ff980a",
                        boxShadow: `0 0 10px ${i % 2 === 0 ? "rgba(185,72,136,0.6)" : "rgba(255,152,10,0.6)"}`,
                      }}
                    />

                    {/* Right slot */}
                    {!isLeft && (
                      <div className="col-start-2 pl-8 space-y-1">
                        <p
                          className="text-2xl font-bold"
                          style={{ color: "#ff980a" }}
                        >
                          {m.year}
                        </p>
                        <p className="font-semibold text-sm text-white">{m.title}</p>
                        <p className="text-sm text-white/45 leading-relaxed">{m.desc}</p>
                      </div>
                    )}
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. CTA SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 text-center overflow-hidden" style={{ background: "#130010" }}>
        <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.05]" />

        <FadeUp className="relative space-y-6 max-w-xl mx-auto">
          <Label>READY WHEN YOU ARE</Label>
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
            Come taste{" "}
            <span
              className="italic"
              style={{
                background:
                  "linear-gradient(135deg, #b94888 0%, #ff980a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              the bliss.
            </span>
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-md mx-auto">
            Cold milk tea on a hot afternoon. A loaded shawarma after a long day.
            Find us at Abura Taxi Station or order online.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              href="/order"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #b94888 0%, #ff980a 100%)",
              }}
            >
              ORDER NOW
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] backdrop-blur px-8 py-3 text-sm font-bold text-white/80 hover:bg-white/[0.10] hover:text-white transition-all duration-200"
            >
              BACK HOME
            </Link>
          </div>

          <p className="text-[11px] text-white/25 tracking-wide pt-1">
            Abura Taxi Station &nbsp;&middot;&nbsp; +233 53 644 0126
          </p>
        </FadeUp>
      </section>

    </div>
  );
}
