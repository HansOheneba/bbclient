"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeUp, SectionLabel } from "@/components/home/shared";

export default function CustomisationSection() {
  return (
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
            We know everyone&apos;s taste is different. That&apos;s why every
            order at Bubble Bliss is built around you — sweetness level, spice
            level, toppings, special requests. You call it. We make it.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Sugar Level", "0% to 100%"],
              ["Spice Level", "Mild to hot"],
              ["Free Topping", "One on us"],
              ["Special Notes", "Any request"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl border border-white/[0.07] p-4 space-y-1 hover:border-[#b94888]/20 transition-colors"
              >
                <p className="text-xs font-bold text-white/85">{k}</p>
                <p className="text-xs font-bold" style={{ color: "#b94888" }}>
                  {v}
                </p>
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
          <div
            className="relative overflow-hidden"
            style={{ minHeight: "560px" }}
          >
            <Image
              src="https://i.pinimg.com/736x/ae/64/32/ae64320d38a6526f96f65c5a38c95bed.jpg"
              alt="Custom boba order"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute top-5 right-5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md px-4 py-2">
              <p
                className="text-[10px] tracking-[0.22em] font-bold uppercase"
                style={{ color: "#ff980a" }}
              >
                Your Order · Your Rules
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
