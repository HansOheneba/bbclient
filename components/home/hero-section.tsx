"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
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
      <div
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "95vh" }}
      >
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
            More Than
            <br />
            <span className="italic" style={{ color: "#b94888" }}>
              Just Boba.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/55 max-w-md mx-auto leading-relaxed">
            Premium boba, iced teas, milkshakes and loaded shawarma — every
            order made fresh, every time.
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <span className="text-[9px] tracking-[0.4em] uppercase">Scroll</span>
          <div className="h-7 w-px bg-white/15" />
        </motion.div>
      </div>
    </section>
  );
}
