"use client";

import Link from "next/link";
import { Clock, MapPin, Phone, ArrowRight } from "lucide-react";
import { FadeUp, SectionLabel } from "@/components/home/shared";

const hours = [
  { day: "Tue – Sat", time: "2:00 pm – 9:30 pm" },
  { day: "Sunday", time: "3:00 pm – 9:00 pm" },
  { day: "Monday", time: "Closed" },
];

export default function LocationSection() {
  return (
    <section
      className="relative z-10 grid grid-cols-1 lg:grid-cols-2"
      style={{ background: "#130010" }}
    >
      {/* HOURS */}
      <FadeUp>
        <div
          className="flex flex-col justify-center gap-8 px-10 sm:px-20 py-24 border-b lg:border-b-0 lg:border-r border-white/[0.06]"
          style={{ minHeight: "460px" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(185,72,136,0.15)",
                border: "1px solid rgba(185,72,136,0.25)",
              }}
            >
              <Clock size={20} style={{ color: "#b94888" }} />
            </div>
            <div>
              <SectionLabel>HOURS</SectionLabel>
              <p className="font-bold text-2xl -mt-1">When we&apos;re open</p>
            </div>
          </div>
          <div className="space-y-5">
            {hours.map(({ day, time }) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-white/45 text-base">{day}</span>
                <span
                  className={`text-base font-semibold ${time === "Closed" ? "text-white/20" : "text-white/90"}`}
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
              style={{
                background: "rgba(255,152,10,0.15)",
                border: "1px solid rgba(255,152,10,0.25)",
              }}
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
            <span className="text-white font-semibold">Abura Taxi Station</span>
            , Cape Coast. Walk in, or order online from anywhere.
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
  );
}
