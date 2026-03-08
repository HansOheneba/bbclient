"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Design tokens (shared with checkout page) ─────────────────────────────
const pageBg = "bg-gradient-to-br from-[#4A1942] via-[#2D1B3D] to-[#1A1625]";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ── Inner component (requires useSearchParams ⇒ must be inside Suspense) ──
function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const clientReference = searchParams.get("ref");
  const [isIframe, setIsIframe] = React.useState(false);

  React.useEffect(() => {
    // Detect whether we are inside an iframe
    const inIframe = window !== window.top;
    setIsIframe(inIframe);

    if (inIframe) {
      // Notify the parent checkout page immediately so it can transition to
      // the success screen without waiting for the polling cycle.
      window.parent.postMessage(
        {
          type: "HUBTEL_PAYMENT_SUCCESS",
          clientReference: clientReference ?? "",
        },
        window.location.origin,
      );
    }
  }, [clientReference]);

  // ── When inside iframe: show a minimal "redirecting" indicator ────────────
  // The parent page will take over the UI so the user won't see this for long.
  if (isIframe) {
    return (
      <div
        className={cn(
          "min-h-screen flex flex-col items-center justify-center gap-4 text-white",
          pageBg,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-emerald-300" />
        <p className="text-sm text-white/70">Payment confirmed. Redirecting…</p>
      </div>
    );
  }

  // ── When loaded directly (redirect-checkout flow) ────────────────────────
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        pageBg,
      )}
    >
      <div className="max-w-md w-full text-center space-y-6 text-white">
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/25">
          <CheckCircle2 className="h-10 w-10 text-emerald-300" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Payment successful! 🫧</h1>
          <p className="text-sm text-white/70">
            Your Bubble Bliss order is being prepared. You will receive an SMS
            confirmation shortly.
          </p>
        </div>

        {clientReference && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 text-left space-y-1">
            <p className="text-xs text-white/60">Order reference</p>
            <p className="font-mono text-sm font-semibold break-all">
              {clientReference}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full rounded-2xl h-12">
            <Link href="/order">Order more</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="w-full rounded-2xl h-12 bg-white/10 text-white hover:bg-white/15 border border-white/10"
          >
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page export (wrapped in Suspense for useSearchParams) ──────────────────
export default function PaymentSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div
          className={cn(
            "min-h-screen flex items-center justify-center",
            pageBg,
          )}
        >
          <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        </div>
      }
    >
      <PaymentSuccessInner />
    </React.Suspense>
  );
}
