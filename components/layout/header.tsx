"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GlassPopover,
  GlassPopoverTrigger,
  GlassPopoverContent,
} from "@/components/glass-popover";

type NavItem = {
  label: string;
  href: string;
};

type HeaderProps = {
  brandName?: string;
  logoSrc?: string; // from /public
  leftLabel?: string;
  rightLabel?: string;
  navItems?: NavItem[];
  activeHref?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(!!mq.matches);

    onChange();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }

    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  return reduced;
}

/**
 * Hides header when scrolling down, shows when scrolling up.
 * Has a small threshold so it doesn't flicker on tiny scroll moves.
 */
function useHideOnScroll(opts?: {
  threshold?: number;
  topAlwaysVisible?: number;
}) {
  const threshold = opts?.threshold ?? 10;
  const topAlwaysVisible = opts?.topAlwaysVisible ?? 40;

  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;

        // Always show near the top
        if (y <= topAlwaysVisible) {
          setHidden(false);
          lastY = y;
          ticking = false;
          return;
        }

        if (Math.abs(delta) < threshold) {
          ticking = false;
          return;
        }

        // Down scroll -> hide. Up scroll -> show.
        if (delta > 0) setHidden(true);
        else setHidden(false);

        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topAlwaysVisible]);

  return hidden;
}

export default function GlassHeader({
  brandName = "Bubble Bliss",
  logoSrc = "/bbl-white.png",
  leftLabel = "OUR MENU",
  rightLabel = "OUR STORY",
  navItems = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/order" },
    { label: "Our Story", href: "/story" },
  ],
  activeHref,
}: HeaderProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  const hidden = useHideOnScroll({ threshold: 10, topAlwaysVisible: 40 });

  return (
    <motion.header
      className="sticky top-4 z-50 px-4"
      initial={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
      animate={
        hidden
          ? {
              opacity: 0,
              scale: 0.72,
              y: -4,
              filter: "blur(8px)",
              pointerEvents: "none" as const,
              transition: prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.16, ease: [0.4, 0, 1, 1] },
            }
          : {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              pointerEvents: "auto" as const,
              transition: prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            }
      }
    >
      {/* Outer glass bar */}
      <div className="mx-auto max-w-7xl">
        <div
          className={cx(
            "relative rounded-full border",
            "bg-white/[0.06] backdrop-blur-md",
            "shadow-[0_10px_40px_rgba(0,0,0,0.25)]",
          )}
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          {/* subtle glow */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.20),transparent_55%)]" />

          <div className="relative flex h-16 items-center justify-between px-5 sm:px-7">
            {/* Left label (desktop) */}
            <Link
              href="/#menu"
              className={cx(
                "hidden sm:inline-flex items-center",
                "text-xs font-extrabold tracking-[0.34em]",
                "text-white/80 hover:text-white transition",
              )}
            >
              {leftLabel}
            </Link>

            {/* Center "island" logo */}
            <Link
              href="/"
              className={cx(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                "rounded-full border",
                "bg-white/[0.07] backdrop-blur-xl",
                "shadow-[0_12px_45px_rgba(0,0,0,0.35)]",
                "px-5 py-2",
                "flex items-center gap-3",
              )}
              style={{ borderColor: "rgba(255,255,255,0.14)" }}
              aria-label={brandName}
            >
              <span className="relative h-8 w-24 sm:h-9 sm:w-28">
                <Image
                  src={logoSrc}
                  alt={brandName}
                  fill
                  className="object-contain"
                  priority
                />
              </span>

              <span
                className="hidden md:inline-block h-6 w-px"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              />
              <span className="hidden md:inline-block text-xs font-semibold tracking-wide text-white/75">
                Cafe • Boba • Shawarma
              </span>
            </Link>

            {/* Right label (desktop) */}
            <Link
              href="/#story"
              className={cx(
                "hidden sm:inline-flex items-center",
                "text-xs font-extrabold tracking-[0.34em]",
                "text-white/80 hover:text-white transition",
              )}
            >
              {rightLabel}
            </Link>

            {/* Mobile: left (menu) + right (popover) */}
            <div className="flex w-full items-center justify-between sm:hidden">
              <Link
                href="/#menu"
                className="text-xs font-extrabold tracking-[0.34em] text-white/80"
              >
                MENU
              </Link>

              <GlassPopover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <GlassPopoverTrigger asChild>
                  <button
                    type="button"
                    className={cx(
                      "rounded-full border px-4 py-2 text-xs font-bold tracking-wide",
                      "bg-white/[0.06] text-white/85",
                      "hover:bg-white/[0.10] transition",
                    )}
                    style={{ borderColor: "rgba(255,255,255,0.12)" }}
                    aria-label="Open navigation"
                  >
                    MORE
                  </button>
                </GlassPopoverTrigger>

                <GlassPopoverContent className="w-56">
                  <nav className="grid gap-2">
                    {navItems.map((item) => {
                      const active = activeHref
                        ? item.href === activeHref
                        : false;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setPopoverOpen(false)}
                          className={cx(
                            "rounded-2xl border px-4 py-3 text-sm font-semibold",
                            "bg-white/[0.05] text-white/85",
                            "hover:bg-white/[0.09] transition",
                            active && "ring-1 ring-white/25",
                          )}
                          style={{ borderColor: "rgba(255,255,255,0.12)" }}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </GlassPopoverContent>
              </GlassPopover>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
