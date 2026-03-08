"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageBg = "bg-gradient-to-br from-[#4A1942] via-[#2D1B3D] to-[#1A1625]";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function PaymentCancelledInner() {
  const searchParams = useSearchParams();
  const clientReference = searchParams.get("ref");
  const [isIframe, setIsIframe] = React.useState(false);

  React.useEffect(() => {
    const inIframe = window !== window.top;
    setIsIframe(inIframe);

    if (inIframe) {
      window.parent.postMessage(
        {
          type: "HUBTEL_PAYMENT_CANCELLED",
          clientReference: clientReference ?? "",
        },
        window.location.origin,
      );
    }
  }, [clientReference]);

  if (isIframe) {
    return (
      <div
        className={cn(
          "min-h-screen flex flex-col items-center justify-center gap-4 text-white",
          pageBg,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-red-300" />
        <p className="text-sm text-white/70">Payment cancelled. Redirecting…</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        pageBg,
      )}
    >
      <div className="max-w-md w-full text-center space-y-6 text-white">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center border border-red-500/25">
          <XCircle className="h-10 w-10 text-red-300" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Payment cancelled</h1>
          <p className="text-sm text-white/70">
            Your payment was cancelled. You have not been charged. You can go
            back and try again.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full rounded-2xl h-12">
            <Link href="/order/checkout">Try again</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="w-full rounded-2xl h-12 bg-white/10 text-white hover:bg-white/15 border border-white/10"
          >
            <Link href="/order">Back to menu</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
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
      <PaymentCancelledInner />
    </React.Suspense>
  );
}
