"use client";

import { FadeUp } from "@/components/home/shared";
import { promises } from "@/components/home/data";

export default function PromiseStrip() {
  return (
    <FadeUp>
      <section
        className="relative z-10 py-16 px-6 overflow-hidden"
        style={{ background: "#000000" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.04]" />
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] px-0">
          {promises.map(({ label, detail }, i) => (
            <div
              key={label}
              className="space-y-2 text-center sm:text-left px-8 py-6 sm:py-0"
            >
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div
                  className="w-1.5 h-6 rounded-full shrink-0"
                  style={{ background: i % 2 === 0 ? "#b94888" : "#7c3070" }}
                />
                <p className="text-sm font-bold text-white">{label}</p>
              </div>
              <p className="text-[13px] text-white/40 leading-relaxed">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </FadeUp>
  );
}
