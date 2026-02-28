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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { formatGhs, toppings } from "@/lib/menu-data";
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
        // Network hiccup — keep polling silently
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

  // ── Success screen ────────────────────────
  if (screen === "success" && checkoutData) {
    return (
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Payment confirmed! 🫧</h1>
          <p className="text-muted-foreground">
            Your order has been received and we&apos;re starting preparation
            now. You&apos;ll receive an SMS confirmation shortly.
          </p>
          <div className="rounded-2xl border bg-card p-4 text-left space-y-2">
            <p className="text-sm text-muted-foreground">Order reference</p>
            <p className="font-mono text-sm font-semibold">
              #{checkoutData.orderId}
            </p>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {checkoutData.clientReference}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full rounded-2xl">
              <Link href="/order">Order more</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full rounded-2xl">
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
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Payment failed</h1>
          <p className="text-muted-foreground">
            {pollStatus !== "Waiting for payment…"
              ? pollStatus
              : "Your payment could not be completed. You have not been charged."}
          </p>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-2xl"
              onClick={() => {
                setScreen("checkout");
                setCheckoutData(null);
                setPollStatus("Waiting for payment…");
                setApiError(null);
              }}
            >
              Try again
            </Button>
            <Button asChild variant="secondary" className="w-full rounded-2xl">
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
      <div className="min-h-screen bg-black text-foreground flex flex-col items-center justify-start">
        {/* Header */}
        <div className="w-full max-w-2xl px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => {
              setScreen("checkout");
              setCheckoutData(null);
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="font-semibold">Complete Payment</p>
            <p className="text-xs text-muted-foreground">
              GHS {checkoutData.totalGhs.toFixed(2)} · Order #
              {checkoutData.orderId}
            </p>
          </div>
        </div>

        {/* Hubtel iframe */}
        <div className="w-full max-w-2xl flex-1 px-4 pb-6">
          <div
            className="rounded-3xl overflow-hidden border bg-card shadow-lg w-full"
            style={{ minHeight: "600px" }}
          >
            <iframe
              src={checkoutData.checkoutDirectUrl}
              className="w-full"
              style={{ height: "660px", border: "none" }}
              title="Hubtel Payment"
              allow="payment"
            />
          </div>

          {/* Polling status */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{pollStatus}</span>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground justify-center">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Secure payment powered by Hubtel. Do not close this page.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading / hydration ───────────────────
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="min-w-0">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="mt-1 h-3 w-48 rounded" />
            </div>
            <div className="flex-1" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <section className="rounded-3xl border bg-card shadow-sm p-5 sm:p-6 space-y-5">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
              <Separator />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </section>
            <section className="rounded-3xl border bg-card shadow-sm p-5 sm:p-6 space-y-4">
              <Skeleton className="h-5 w-36 rounded" />
              <Separator />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-4 w-14 rounded" />
                </div>
              ))}
              <Separator />
              <Skeleton className="h-10 w-full rounded-2xl" />
            </section>
          </div>
        </main>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Your cart is empty</h1>
          <p className="text-muted-foreground text-sm">
            Add some items to get started.
          </p>
          <Button asChild className="rounded-2xl">
            <Link href="/order">Browse menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Main checkout form ────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/order">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="font-semibold leading-5">Checkout</p>
            <p className="text-xs text-muted-foreground">
              {count} item{count !== 1 ? "s" : ""} · {formatGhs(total)}
            </p>
          </div>
          <div className="flex-1" />
          <Badge variant="secondary" className="rounded-full">
            {count}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* LEFT: Details form */}
          <section className="rounded-3xl border bg-card shadow-sm p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold">Your details</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                We&apos;ll use these to prepare and deliver your order.
              </p>
            </div>

            <Separator />

            {/* Delivery method toggle */}
            <div className="flex gap-2">
              {(["delivery", "pickup"] as DeliveryMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDeliveryMethod(m)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                    deliveryMethod === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted",
                  )}
                >
                  {m === "delivery" ? (
                    <MapPin className="h-4 w-4" />
                  ) : (
                    <Store className="h-4 w-4" />
                  )}
                  {m === "delivery" ? "Delivery" : "Pick up"}
                </button>
              ))}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                Name
              </label>
              <Input
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={cn(
                  "rounded-xl",
                  errors.customerName && "border-destructive",
                )}
              />
              {errors.customerName && (
                <p className="text-xs text-destructive">
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone
              </label>
              <Input
                placeholder="0XX XXX XXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                type="tel"
                className={cn(
                  "rounded-xl",
                  errors.customerPhone && "border-destructive",
                )}
              />
              {errors.customerPhone && (
                <p className="text-xs text-destructive">
                  {errors.customerPhone}
                </p>
              )}
            </div>

            {/* Location — only for delivery */}
            {deliveryMethod === "delivery" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Delivery location
                </label>
                <LocationPicker
                  value={deliveryLocation}
                  onChange={setDeliveryLocation}
                />
                {errors.deliveryLocation && (
                  <p className="text-xs text-destructive">
                    {errors.deliveryLocation}
                  </p>
                )}
              </div>
            )}

            {deliveryMethod === "pickup" && (
              <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Pickup location</p>
                <p>Bubble Bliss Café — La, Accra</p>
                <p className="text-xs">
                  Your order will be ready in approximately 15–20 minutes.
                </p>
              </div>
            )}
          </section>

          {/* RIGHT: Cart summary */}
          <aside className="lg:sticky lg:top-20 h-fit">
            <section className="rounded-3xl border bg-card shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Review your cart</h2>
                  <Badge variant="secondary" className="rounded-full">
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

                    const img =
                      (l as unknown as { image?: string }).image ??
                      (l as unknown as { itemImage?: string }).itemImage ??
                      null;

                    return (
                      <div
                        key={l.lineId}
                        className="flex items-start gap-3 rounded-2xl border bg-background p-3"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
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
                              <p className="text-xs text-muted-foreground">
                                {l.quantity}× {l.optionLabel}
                              </p>
                            </div>
                            <p className="text-sm font-semibold whitespace-nowrap">
                              {formatGhs(l.unitPriceGhs * l.quantity)}
                            </p>
                          </div>

                          <div className="mt-2 space-y-1">
                            {freeTopping ? (
                              <p className="text-xs text-green-600">
                                Free: {freeTopping}
                              </p>
                            ) : null}
                            {paidToppingLabels.length > 0 ? (
                              <p className="text-xs text-muted-foreground">
                                + {paidToppingLabels.join(", ")}
                              </p>
                            ) : null}
                            {l.sugarLevel !== null ? (
                              <p className="text-xs text-muted-foreground">
                                Sugar:{" "}
                                {levelByValue(sugarLevels, l.sugarLevel)
                                  ?.label ?? "Regular"}
                              </p>
                            ) : null}
                            {l.spiceLevel !== null && l.spiceLevel > 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Spice:{" "}
                                {levelByValue(spiceLevels, l.spiceLevel)
                                  ?.label ?? "No spice"}
                              </p>
                            ) : null}
                            {l.note ? (
                              <p className="text-xs text-muted-foreground italic">
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
                <div className="mt-5 rounded-2xl border bg-background p-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    placeholder="Discount code"
                    className="border-0 shadow-none focus-visible:ring-0"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl"
                    disabled
                  >
                    Apply
                  </Button>
                </div>

                <Separator className="my-5" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatGhs(subtotal)}</span>
                  </div>

                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatGhs(total)}</span>
                  </div>
                </div>

                {/* API error banner */}
                {apiError ? (
                  <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {apiError}
                  </div>
                ) : null}

                {errors.cart ? (
                  <p className="mt-4 text-sm text-destructive text-center">
                    {errors.cart}
                  </p>
                ) : null}

                <Button
                  type="button"
                  className="mt-5 w-full rounded-2xl py-6 text-base"
                  disabled={loading}
                  onClick={handlePlaceOrder}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing payment…
                    </>
                  ) : (
                    <>Pay • {formatGhs(total)}</>
                  )}
                </Button>

                <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
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
                className="w-full rounded-2xl"
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
