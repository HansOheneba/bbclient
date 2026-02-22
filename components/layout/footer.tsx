"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

type HoursRow = { label: string; value: string };

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type ContactRow = {
  label: string;
  value: string;
  href?: string; // e.g. mailto:, tel:, maps url
};

export type FooterProps = {
  brandName?: string;
  tagline?: string;

  hours?: HoursRow[];
  contact?: ContactRow[];

  quickLinks?: FooterLink[];
  legalLinks?: FooterLink[];

  year?: number;

  // Optional: show a subtle floating-dot background like your screenshot
  showGlowDots?: boolean;
};

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="transition-opacity hover:opacity-80"
    >
      {children}
    </a>
  );
}

export default function Footer({
  brandName = "Bubble Bliss Cafe",
  tagline = "Fresh boba & loaded shawarma, crafted with love in every sip and bite.",
  hours = [
    { label: "Tue – Sat", value: "2pm – 9:30pm" },
    { label: "Sun", value: "3pm – 9pm" },
  ],
  contact = [
    {
      label: "123 Bliss Street, Flavor Town",
      value: "Get directions",
      href: "https://maps.google.com/?q=Bubble%20Bliss",
    },
    {
      label: "hello@bubblebliss.com",
      value: "Email us",
      href: "mailto:hello@bubblebliss.com",
    },
    { label: "(555) 123-BOBA", value: "Call us", href: "tel:+15551232622" },
  ],
  quickLinks = [
    { label: "Menu", href: "/#menu" },
    { label: "Order Now", href: "/#order" },
    { label: "Locations", href: "/#locations" },
    { label: "FAQs", href: "/#faqs" },
  ],
  legalLinks = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
  year = new Date().getFullYear(),
  showGlowDots = true,
}: FooterProps) {
  return (
    <footer className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#07040b] via-[#0b0610] to-[#050208]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.10),transparent_60%)]" />

      {/* Decorative dots */}
      {showGlowDots && (
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <span className="absolute left-[10%] top-[20%] h-2 w-2 rounded-full bg-fuchsia-400/25 blur-[0.5px]" />
          <span className="absolute left-[35%] top-[10%] h-2 w-2 rounded-full bg-purple-400/25 blur-[0.5px]" />
          <span className="absolute left-[70%] top-[28%] h-2 w-2 rounded-full bg-pink-400/25 blur-[0.5px]" />
          <span className="absolute left-[88%] top-[55%] h-2 w-2 rounded-full bg-fuchsia-400/20 blur-[0.5px]" />
          <span className="absolute left-[55%] top-[70%] h-2 w-2 rounded-full bg-purple-400/20 blur-[0.5px]" />
        </div>
      )}

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/bbl-white.png"
                alt={`${brandName} logo`}
                width={100}
                height={100}
                className="rounded-full"
              />

              {/* <span className="text-xl font-extrabold tracking-tight text-white">
                {brandName}
              </span> */}
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              {tagline}
            </p>

            {/* Social / small links */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
              <ExternalLink href="https://instagram.com/">
                <span className="underline decoration-white/20 underline-offset-4 hover:decoration-white/50">
                  Instagram
                </span>
              </ExternalLink>
              <ExternalLink href="https://tiktok.com/">
                <span className="underline decoration-white/20 underline-offset-4 hover:decoration-white/50">
                  TikTok
                </span>
              </ExternalLink>
              <ExternalLink href="https://wa.me/">
                <span className="underline decoration-white/20 underline-offset-4 hover:decoration-white/50">
                  WhatsApp
                </span>
              </ExternalLink>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold tracking-[0.28em] text-white/90">
              HOURS
            </h3>

            <div className="space-y-2 text-sm">
              {hours.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-white/70">{row.label}</span>
                  <span className="text-white/85">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="pt-3">
              <h4 className="mb-2 text-[11px] font-bold tracking-[0.22em] text-white/70">
                QUICK LINKS
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {quickLinks.map((l) =>
                  l.external ? (
                    <ExternalLink key={l.href} href={l.href}>
                      <span className="text-white/75 underline decoration-white/15 underline-offset-4 hover:text-white hover:decoration-white/40">
                        {l.label}
                      </span>
                    </ExternalLink>
                  ) : (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="text-white/75 underline decoration-white/15 underline-offset-4 transition hover:text-white hover:decoration-white/40"
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold tracking-[0.28em] text-white/90">
              CONTACT
            </h3>

            <div className="space-y-3 text-sm">
              {contact.map((c, idx) => (
                <div key={`${c.label}-${idx}`} className="space-y-1">
                  <div className="text-white/75">{c.label}</div>
                  {c.href ? (
                    <ExternalLink href={c.href}>
                      <span className="text-white/65 underline decoration-white/15 underline-offset-4 hover:text-white hover:decoration-white/40">
                        {c.value}
                      </span>
                    </ExternalLink>
                  ) : (
                    <div className="text-white/65">{c.value}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Legal links */}
            <div className="pt-3">
              <div className="flex flex-wrap gap-4 text-xs text-white/60">
                {legalLinks.map((l) =>
                  l.external ? (
                    <ExternalLink key={l.href} href={l.href}>
                      <span className="underline decoration-white/15 underline-offset-4 hover:text-white/80 hover:decoration-white/35">
                        {l.label}
                      </span>
                    </ExternalLink>
                  ) : (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="underline decoration-white/15 underline-offset-4 transition hover:text-white/80 hover:decoration-white/35"
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <div className="text-xs text-white/45">
            © {year} {brandName}. All rights reserved.
          </div>

          <div className="text-xs text-white/45">
            Crafted with <span className="text-white/70">love</span>.
          </div>
        </div>
      </div>
    </footer>
  );
}
