"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeUp, SectionLabel } from "@/components/home/shared";
import { categories } from "@/components/home/data";

export default function MenuCategoriesSection() {
  return (
    <section className="relative z-10 py-24" style={{ background: "#000000" }}>
      <FadeUp className="text-center mb-12 px-6">
        <SectionLabel>THE FULL MENU</SectionLabel>
        <h2 className="text-3xl sm:text-5xl font-bold">
          Five categories.
          <br />
          <span className="text-white/35 font-normal text-2xl sm:text-3xl">
            Zero boring options.
          </span>
        </h2>
      </FadeUp>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0">
        {categories.map(({ key, label, img }, i) => (
          <FadeUp key={key} delay={i * 0.07}>
            <Link
              href="/order"
              className="group relative block overflow-hidden"
              style={{ minHeight: "420px" }}
            >
              <Image
                src={img}
                alt={label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
              />
              <div className="absolute inset-0 bg-black/55 transition-opacity duration-300" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: "rgba(185,72,136,0.22)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-1">
                <p className="text-lg font-bold text-white leading-tight group-hover:text-[#cc94b4] transition-colors">
                  {label}
                </p>
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
  );
}
