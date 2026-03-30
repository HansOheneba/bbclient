"use client";

import * as React from "react";
import { FadeUp, SectionLabel } from "@/components/home/shared";

export default function NewsletterSection() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <FadeUp>
      <section
        className="relative z-10 py-20 px-6 overflow-hidden"
        style={{ background: "#000000" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[#b94888]/[0.04]" />
        <div className="relative mx-auto max-w-xl text-center space-y-5">
          <SectionLabel light>STAY IN THE LOOP</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold">
            New drinks. New specials.
            <br />
            First access.
          </h2>
          <p className="text-white/35 text-sm">
            Drop your email — we&apos;ll let you know when something new drops
            before anyone else.
          </p>
          {submitted ? (
            <p className="text-sm font-bold" style={{ color: "#b94888" }}>
              You&apos;re on the list. We&apos;ll be in touch.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubmitted(true);
              }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 w-full rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#b94888]/50 transition"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full px-6 py-3 text-sm font-bold text-white transition hover:scale-105"
                style={{ background: "#b94888" }}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </FadeUp>
  );
}
