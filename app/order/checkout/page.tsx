"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Store,
  Phone,
  User,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Loader2,
  XCircle,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { formatGhs, toppings } from "@/lib/menu-data";
import { useCatalog } from "@/lib/use-catalog";
import { sugarLevels, spiceLevels, levelByValue } from "@/lib/levels";
import { useCartStore, type DeliveryMethod } from "@/lib/store";
import { getOrderStatusApi, type CheckoutResponse } from "@/lib/api";
import LocationPicker from "@/components/location-picker";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Screen = "checkout" | "payment" | "success" | "failed";

export default function CheckoutPage() {
  // ── Zustand state ─────────────────────────
  const cart = useCartStore((s) => s.cart);
  const cartCount = useCartStore((s) => s.cartCount);
  const cartTotal = useCartStore((s) => s.cartTotal);

  const customerName = useCartStore((s) => s.customerName);
  const customerPhone = useCartStore((s) => s.customerPhone);
  const deliveryMethod = useCartStore((s) => s.deliveryMethod);
  const deliveryLocation = useCartStore((s) => s.deliveryLocation);

  const setCustomerName = useCartStore((s) => s.setCustomerName);
  const setCustomerPhone = useCartStore((s) => s.setCustomerPhone);
  const setDeliveryMethod = useCartStore((s) => s.setDeliveryMethod);
  const setDeliveryLocation = useCartStore((s) => s.setDeliveryLocation);

  const placeOrder = useCartStore((s) => s.placeOrder);
  const confirmOrder = useCartStore((s) => s.confirmOrder);

  // ── Local UI state ────────────────────────
  const [screen, setScreen] = React.useState<Screen>("checkout");
  const [checkoutData, setCheckoutData] =
    React.useState<CheckoutResponse | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [pollStatus, setPollStatus] = React.useState<string>(
    "Waiting for payment…",
  );

  // Hydration guard for SSR
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  // ── Derived ───────────────────────────────
  const subtotal = hydrated ? cartTotal() : 0;
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const count = hydrated ? cartCount() : 0;

  // Catalog for resolving item metadata (images, etc.) for cart lines
  const { items: catalogItems } = useCatalog();

  // ── Poll for payment status ───────────────
  React.useEffect(() => {
    if (screen !== "payment" || !checkoutData?.clientReference) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 60; // 3 minutes at 3s intervals

    const interval = setInterval(async () => {
      attempts++;

      try {
        const status = await getOrderStatusApi(checkoutData.clientReference);

        if (status.paymentStatus === "paid") {
          clearInterval(interval);
          confirmOrder(checkoutData);
          setScreen("success");
        } else if (status.paymentStatus === "failed") {
          clearInterval(interval);
          setScreen("failed");
        }
      } catch {
        // Network hiccup, keep polling silently
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        setPollStatus(
          "Payment timed out. Please contact us if you were charged.",
        );
        setScreen("failed");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [screen, checkoutData, confirmOrder]);

  // ── Validation ────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customerName = "Name is required";
    if (!customerPhone.trim()) errs.customerPhone = "Phone number is required";
    if (
      deliveryMethod === "delivery" &&
      (!deliveryLocation || !deliveryLocation.label.trim())
    ) {
      errs.deliveryLocation = "Please select a delivery location";
    }
    if (cart.length === 0) errs.cart = "Your cart is empty";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const response = await placeOrder();
      setCheckoutData(response);
      setScreen("payment");
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Theme helpers (dark, app-like) ─────────
  const pageBg =
    "bg-gradient-to-b from-[#0B0F17] via-[#070A10] to-[#05060B] text-white";
  const topBar =
    "border-b border-white/10 bg-black/35 backdrop-blur supports-[backdrop-filter]:bg-black/25";
  const card =
    "rounded-[26px] border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]";
  const surface =
    "rounded-[22px] border border-white/10 bg-white/4 hover:bg-white/6 transition-colors";
  const mutedText = "text-white/65";
  const mutedText2 = "text-white/55";

  // ── Success screen ────────────────────────
  if (screen === "success" && checkoutData) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center p-4",
          pageBg,
        )}
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/25">
            <CheckCircle2 className="h-10 w-10 text-emerald-300" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Order confirmed 🫧</h1>
            <p className={cn("text-sm", mutedText)}>
              Your payment is completed and we are starting preparation. You
              will receive an SMS confirmation shortly.
            </p>
          </div>

          <div className={cn("p-4 text-left space-y-2", card)}>
            <p className={cn("text-xs", mutedText2)}>Order reference</p>
            <p className="font-mono text-sm font-semibold">
              #{checkoutData.orderId}
            </p>
            <p className={cn("font-mono text-xs break-all", mutedText2)}>
              {checkoutData.clientReference}
            </p>
          </div>

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

  // ── Failed screen ─────────────────────────
  if (screen === "failed") {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center p-4",
          pageBg,
        )}
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center border border-red-500/25">
            <XCircle className="h-10 w-10 text-red-300" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Payment failed</h1>
            <p className={cn("text-sm", mutedText)}>
              {pollStatus !== "Waiting for payment…"
                ? pollStatus
                : "Your payment could not be completed. You have not been charged."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-2xl h-12"
              onClick={() => {
                setScreen("checkout");
                setCheckoutData(null);
                setPollStatus("Waiting for payment…");
                setApiError(null);
              }}
            >
              Try again
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

  // ── Payment iframe screen ─────────────────
  if (screen === "payment" && checkoutData) {
    return (
      <div className={cn("min-h-screen", pageBg)}>
        {/* Header */}
        <div className={cn("sticky top-0 z-40", topBar)}>
          <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
              onClick={() => {
                setScreen("checkout");
                setCheckoutData(null);
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="min-w-0">
              <p className="font-semibold leading-5">Checkout</p>
              <p className={cn("text-xs", mutedText)}>
                GHS {checkoutData.totalGhs.toFixed(2)} · Order #
                {checkoutData.orderId}
              </p>
            </div>

            <div className="flex-1" />

            <Badge className="rounded-full bg-white/10 text-white border border-white/10">
              Pay
            </Badge>
          </div>
        </div>

        <main className="mx-auto max-w-2xl px-4 py-6">
          <div className="space-y-4">
            {/* Payment container that creates “padding illusion” around the white iframe */}
            <section className={cn("p-4 sm:p-5", card)}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">Complete payment</p>
                  <p className={cn("text-sm mt-1", mutedText)}>
                    Keep this page open while the payment is processing.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className={cn("text-xs", mutedText2)}>Total</p>
                  <p className="font-semibold">
                    GHS {checkoutData.totalGhs.toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator className="my-4 bg-white/10" />

              {/* Outer pad to separate white iframe from dark UI */}
              <div className="rounded-[22px] bg-white/6 border border-white/10 p-3 sm:p-4">
                {/* Inner white “paper” frame */}
                <div className="rounded-[18px] bg-white overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                  <iframe
                    src={checkoutData.checkoutDirectUrl}
                    className="w-full"
                    style={{ height: "690px", border: "none" }}
                    title="Hubtel Payment"
                    allow="payment"
                  />
                </div>
              </div>

              {/* Polling status */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{pollStatus}</span>
              </div>

              <div className="mt-3 flex items-start gap-2 text-xs text-white/60 justify-center">
                <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Secure payment powered by Hubtel. Do not close this page.</p>
              </div>
            </section>

            <Button
              variant="secondary"
              className="w-full rounded-2xl h-12 bg-white/10 text-white hover:bg-white/15 border border-white/10"
              onClick={() => {
                setScreen("checkout");
                setCheckoutData(null);
              }}
            >
              Back to checkout
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ── Loading / hydration ───────────────────
  if (!hydrated) {
    return (
      <div className={cn("min-h-screen", pageBg)}>
        <header className={cn("sticky top-0 z-40", topBar)}>
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
            <div className="min-w-0">
              <Skeleton className="h-5 w-24 rounded bg-white/10" />
              <Skeleton className="mt-1 h-3 w-48 rounded bg-white/10" />
            </div>
            <div className="flex-1" />
            <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <section className={cn("p-5 sm:p-6 space-y-5", card)}>
              <Skeleton className="h-5 w-48 rounded bg-white/10" />
              <Skeleton className="h-4 w-64 rounded bg-white/10" />
              <Separator className="bg-white/10" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-full bg-white/10" />
                <Skeleton className="h-10 w-32 rounded-full bg-white/10" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
              <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
              <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
            </section>
            <section className={cn("p-5 sm:p-6 space-y-4", card)}>
              <Skeleton className="h-5 w-36 rounded bg-white/10" />
              <Separator className="bg-white/10" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg shrink-0 bg-white/10" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3 rounded bg-white/10" />
                    <Skeleton className="h-3 w-1/2 rounded bg-white/10" />
                  </div>
                  <Skeleton className="h-4 w-14 rounded bg-white/10" />
                </div>
              ))}
              <Separator className="bg-white/10" />
              <Skeleton className="h-10 w-full rounded-2xl bg-white/10" />
            </section>
          </div>
        </main>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────
  if (cart.length === 0) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center p-4",
          pageBg,
        )}
      >
        <div className="max-w-md w-full text-center space-y-6">
          <ShoppingBag className="mx-auto h-12 w-12 text-white/60" />
          <h1 className="text-xl font-semibold">Your cart is empty</h1>
          <p className="text-white/65 text-sm">
            Add some items to get started.
          </p>
          <Button asChild className="rounded-2xl h-12">
            <Link href="/order">Browse menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Main checkout form ────────────────────
  return (
    <div className={cn("min-h-screen", pageBg)}>
      {/* Header */}
      <header className={cn("sticky top-0 z-40", topBar)}>
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Link href="/order">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="min-w-0">
            <p className="font-semibold leading-5">Checkout</p>
            <p className={cn("text-xs", mutedText)}>
              {count} item{count !== 1 ? "s" : ""} · {formatGhs(total)}
            </p>
          </div>

          <div className="flex-1" />

          <Badge className="rounded-full bg-white/10 text-white border border-white/10">
            {count}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* LEFT: Details form */}
          <section className={cn("p-5 sm:p-6 space-y-5", card)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Your details</h2>
                <p className={cn("text-sm mt-0.5", mutedText)}>
                  We use this info to prepare and deliver your order.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/6 border border-white/10 px-3 py-1.5">
                <ShieldCheck className="h-4 w-4 text-white/70" />
                <span className="text-xs text-white/70">Secure</span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Delivery method toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(["delivery", "pickup"] as DeliveryMethod[]).map((m) => {
                const active = deliveryMethod === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDeliveryMethod(m)}
                    className={cn(
                      "flex items-center justify-between gap-2 px-4 py-3 rounded-2xl text-sm font-medium border transition-colors",
                      active
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white border-white/10 hover:bg-white/8",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {m === "delivery" ? (
                        <MapPin
                          className={cn(
                            "h-4 w-4",
                            active ? "text-black" : "text-white/70",
                          )}
                        />
                      ) : (
                        <Store
                          className={cn(
                            "h-4 w-4",
                            active ? "text-black" : "text-white/70",
                          )}
                        />
                      )}
                      {m === "delivery" ? "Delivery" : "Pick up"}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4",
                        active ? "text-black/70" : "text-white/40",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5 text-white/90">
                <User className="h-4 w-4 text-white/60" />
                Name
              </label>
              <Input
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={cn(
                  "rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/35 focus-visible:ring-0 focus-visible:border-white/25",
                  errors.customerName && "border-red-400/50",
                )}
              />
              {errors.customerName ? (
                <p className="text-xs text-red-300">{errors.customerName}</p>
              ) : null}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5 text-white/90">
                <Phone className="h-4 w-4 text-white/60" />
                Phone
              </label>
              <Input
                placeholder="0XX XXX XXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                type="tel"
                className={cn(
                  "rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/35 focus-visible:ring-0 focus-visible:border-white/25",
                  errors.customerPhone && "border-red-400/50",
                )}
              />
              {errors.customerPhone ? (
                <p className="text-xs text-red-300">{errors.customerPhone}</p>
              ) : null}
            </div>

            {/* Location — only for delivery */}
            {deliveryMethod === "delivery" ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5 text-white/90">
                  <MapPin className="h-4 w-4 text-white/60" />
                  Delivery location
                </label>
                <div className={cn("p-3", surface)}>
                  <LocationPicker
                    value={deliveryLocation}
                    onChange={setDeliveryLocation}
                  />
                </div>
                {errors.deliveryLocation ? (
                  <p className="text-xs text-red-300">
                    {errors.deliveryLocation}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className={cn("p-4 text-sm space-y-1", surface)}>
                <p className="font-medium text-white">Pickup location</p>
                <p className={cn("text-sm", mutedText)}>
                  Bubble Bliss Café, La, Accra
                </p>
                <p className={cn("text-xs", mutedText2)}>
                  Your order will be ready in approximately 15–20 minutes.
                </p>
              </div>
            )}
          </section>

          {/* RIGHT: Cart summary */}
          <aside className="lg:sticky lg:top-20 h-fit">
            <section className={cn("overflow-hidden", card)}>
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Order summary</h2>
                  <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                    {count}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {cart.map((l) => {
                    const freeTopping = l.freeToppingId
                      ? toppings.find((t) => t.id === l.freeToppingId)?.name
                      : null;
                    const paidToppingLabels = l.toppingIds
                      .map((id) => toppings.find((t) => t.id === id)?.name)
                      .filter(Boolean) as string[];

                    const product = catalogItems.find(
                      (it) => it.id === l.itemId,
                    );
                    const img =
                      (l as unknown as { image?: string }).image ??
                      (l as unknown as { itemImage?: string }).itemImage ??
                      product?.image ??
                      null;

                    return (
                      <div
                        key={l.lineId}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/4 p-3"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                          {img ? (
                            <Image
                              src={img}
                              alt={l.itemName}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold leading-5 truncate">
                                {l.itemName}
                              </p>
                              <p className={cn("text-xs", mutedText2)}>
                                {l.quantity}× {l.optionLabel}
                              </p>
                            </div>
                            <p className="text-sm font-semibold whitespace-nowrap">
                              {formatGhs(l.unitPriceGhs * l.quantity)}
                            </p>
                          </div>

                          <div className="mt-2 space-y-1">
                            {freeTopping ? (
                              <p className="text-xs text-emerald-300">
                                Free: {freeTopping}
                              </p>
                            ) : null}
                            {paidToppingLabels.length > 0 ? (
                              <p className={cn("text-xs", mutedText2)}>
                                + {paidToppingLabels.join(", ")}
                              </p>
                            ) : null}
                            {l.sugarLevel !== null ? (
                              <p className={cn("text-xs", mutedText2)}>
                                Sugar:{" "}
                                {levelByValue(sugarLevels, l.sugarLevel)
                                  ?.label ?? "Regular"}
                              </p>
                            ) : null}
                            {l.spiceLevel !== null && l.spiceLevel > 0 ? (
                              <p className={cn("text-xs", mutedText2)}>
                                Spice:{" "}
                                {levelByValue(spiceLevels, l.spiceLevel)
                                  ?.label ?? "No spice"}
                              </p>
                            ) : null}
                            {l.note ? (
                              <p className={cn("text-xs italic", mutedText2)}>
                                &ldquo;{l.note}&rdquo;
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon row (UI only) */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                    <Tag className="h-4 w-4 text-white/60" />
                  </div>
                  <Input
                    placeholder="Discount code"
                    className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-white placeholder:text-white/35"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-2xl bg-white/10 text-white hover:bg-white/15 border border-white/10"
                    disabled
                  >
                    Apply
                  </Button>
                </div>

                <Separator className="my-5 bg-white/10" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={mutedText}>Subtotal</span>
                    <span>{formatGhs(subtotal)}</span>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatGhs(total)}</span>
                  </div>
                </div>

                {/* API error banner */}
                {apiError ? (
                  <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {apiError}
                  </div>
                ) : null}

                {errors.cart ? (
                  <p className="mt-4 text-sm text-red-200 text-center">
                    {errors.cart}
                  </p>
                ) : null}

                <Button
                  type="button"
                  className="mt-5 w-full rounded-2xl h-12 text-base"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing payment…
                    </>
                  ) : (
                    <>Pay {formatGhs(total)}</>
                  )}
                </Button>

                <div className="mt-4 flex items-start gap-2 text-xs text-white/60">
                  <ShieldCheck className="h-4 w-4 mt-0.5" />
                  <p>
                    Secure checkout powered by Hubtel. Your details are used
                    only to prepare and deliver your order.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-4 lg:hidden">
              <Button
                asChild
                variant="secondary"
                className="w-full rounded-2xl h-12 bg-white/10 text-white hover:bg-white/15 border border-white/10"
              >
                <Link href="/order">Back to menu</Link>
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
