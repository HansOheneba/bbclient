"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { FadeUp, SectionLabel } from "@/components/home/shared";
import { testimonials } from "@/components/home/data";

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
            const initials = name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2);
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
                <p className="text-[16px] sm:text-[18px] text-white/70 leading-relaxed italic flex-1">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="flex items-center gap-4 border-t border-white/[0.07] pt-5">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: "#b94888" }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-white">{name}</p>
                    <p className="text-xs text-white/30 tracking-wide">
                      Verified Customer
                    </p>
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

export default function TestimonialsSection() {
  return (
    <section
      className="relative z-10 py-28 overflow-hidden"
      style={{ background: "#130010" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.03]" />
      <FadeUp className="text-center mb-14 relative px-6">
        <SectionLabel light>SOCIAL PROOF</SectionLabel>
        <h2 className="text-4xl sm:text-6xl font-bold leading-tight">
          What our neighbours
          <br className="hidden sm:block" /> are saying.
        </h2>
        <p className="mt-5 text-white/35 text-[15px] max-w-md mx-auto leading-relaxed">
          Real orders. Real people. Real opinions from Cape Coast.
        </p>
      </FadeUp>
      <FadeUp delay={0.15}>
        <TestimonialMarquee />
      </FadeUp>
    </section>
  );
}
