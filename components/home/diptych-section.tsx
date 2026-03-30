"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeUp } from "@/components/home/shared";

export default function DiptychSection() {
  return (
    <FadeUp>
      <section
        className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2"
        style={{ minHeight: "520px" }}
      >
        <div
          className="relative overflow-hidden"
          style={{ minHeight: "520px" }}
        >
          <Image
            src="https://i.pinimg.com/736x/ae/64/32/ae64320d38a6526f96f65c5a38c95bed.jpg"
            alt="Bubble Bliss drinks"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div
          className="relative overflow-hidden"
          style={{ minHeight: "520px" }}
        >
          <Image
            src="https://i.pinimg.com/736x/c4/10/06/c41006049b919e5dbbdbb2e972839e5f.jpg"
            alt="Bubble Bliss shawarma"
            fill
            className="object-cover hover:scale-[1.02] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute bottom-8 left-8 right-8 space-y-2">
            <p
              className="text-[9px] tracking-[0.4em] font-bold uppercase"
              style={{ color: "#ff980a" }}
            >
              KITCHEN MENU
            </p>
            <h3 className="text-2xl font-bold">Loaded Shawarma</h3>
            <p className="text-sm text-white/45 leading-relaxed max-w-xs">
              Chicken, beef or mixed — rolled fresh with crisp veg every time.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition mt-1"
            >
              Order food <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>
    </FadeUp>
  );
}
