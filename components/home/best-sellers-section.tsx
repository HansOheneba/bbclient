"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeUp, SectionLabel } from "@/components/home/shared";
import { bestSellers } from "@/components/home/data";

function BestSellersCarousel() {
  const [paused, setPaused] = React.useState(false);
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
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "3/4" }}
              >
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
                <p className="font-bold text-base group-hover:text-[#cc94b4] transition-colors">
                  {item.name}
                </p>
                <p className="text-[12px] text-white/40 tracking-wide">
                  {item.sub}
                </p>
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

export default function BestSellersSection() {
  return (
    <section
      className="relative z-10 py-24 overflow-hidden"
      style={{ background: "#130010" }}
    >
      <FadeUp className="text-center mb-14 px-6">
        <SectionLabel>BEST SELLERS</SectionLabel>
        <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
          The ones they keep
          <br />
          <span className="text-white/35 font-normal text-3xl sm:text-4xl">
            coming back for.
          </span>
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
  );
}
