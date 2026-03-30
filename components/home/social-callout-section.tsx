"use client";

import { FadeUp, SectionLabel } from "@/components/home/shared";

export default function SocialCalloutSection() {
  return (
    <FadeUp>
      <section
        className="relative z-10 overflow-hidden"
        style={{ background: "#000000" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.04]" />
        <div className="relative grid grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* Left — text */}
          <div className="flex flex-col justify-center gap-6 px-10 sm:px-20 py-24">
            <SectionLabel>SHARE THE BLISS</SectionLabel>
            <h2 className="text-4xl sm:text-6xl font-bold leading-tight">
              Show us
              <br />
              your order.
            </h2>
            <p className="text-white/45 text-[16px] leading-relaxed max-w-sm">
              Post your Bubble Bliss moment on Instagram or TikTok and tag us
              with{" "}
              <span className="font-bold" style={{ color: "#b94888" }}>
                #BubbleBlissCafe
              </span>{" "}
              — we feature our favourites every week.
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
            style={{
              minHeight: "420px",
              background: "rgba(185,72,136,0.12)",
              borderLeft: "1px solid rgba(185,72,136,0.15)",
            }}
          >
            <div className="text-center space-y-3 px-8">
              <p
                className="text-6xl sm:text-8xl font-black tracking-tight"
                style={{ color: "#b94888" }}
              >
                #BubbleBlissCafe
              </p>
              <p className="text-white/30 text-sm tracking-[0.2em] uppercase">
                Tag us to be featured
              </p>
            </div>
          </div>
        </div>
      </section>
    </FadeUp>
  );
}
