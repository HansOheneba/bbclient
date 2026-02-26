"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { formatGhs, toppings } from "@/lib/menu-data";
import { sugarLevels, spiceLevels, levelByValue } from "@/lib/levels";
import { useCartStore, type DeliveryMethod } from "@/lib/store";
import LocationPicker from "@/components/location-picker";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function CheckoutPage() {
  const router = useRouter();

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

  // ── Local UI state ────────────────────────
  const [submitted, setSubmitted] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [apiOrderId, setApiOrderId] = React.useState<number | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Hydration guard for SSR
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  // ── Derived ───────────────────────────────
  const subtotal = hydrated ? cartTotal() : 0;
  const deliveryFee = deliveryMethod === "delivery" ? 10 : 0;
  const total = subtotal + deliveryFee;
  const count = hydrated ? cartCount() : 0;

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
      const order = await placeOrder();
      setOrderId(order.id);
      setApiOrderId(order.apiOrderId);
      setSubmitted(true);
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
  if (submitted && orderId) {
    return (
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Order placed!</h1>
          <p className="text-muted-foreground">
            Your order has been received. We&apos;re starting preparation now.
          </p>
          <div className="rounded-2xl border bg-card p-4 text-left space-y-2">
            <p className="text-sm text-muted-foreground">Order reference</p>
            {apiOrderId != null ? (
              <p className="font-mono text-sm font-semibold">#{apiOrderId}</p>
            ) : null}
            <p className="font-mono text-xs text-muted-foreground break-all">
              {orderId}
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
            Add some items before checking out.
          </p>
          <Button asChild className="rounded-2xl">
            <Link href="/order">Browse menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border bg-card p-2 hover:bg-accent/20 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-5">Checkout</h1>
            <p className="text-xs text-muted-foreground">
              Delivery or pick-up, then confirm your details.
            </p>
          </div>

          <div className="flex-1" />

          <Badge variant="secondary" className="rounded-full">
            {count} item{count !== 1 ? "s" : ""}
          </Badge>
        </div>
      </header>

      {/* Main layout: mobile = stacked, desktop = 2 columns */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* LEFT: Form card */}
          <section className="rounded-3xl border bg-card shadow-sm">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    Shipping information
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose delivery method and add contact details.
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  Step 1 of 2
                </Badge>
              </div>

              <Separator className="my-5" />

              {/* Delivery method */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { key: "delivery", label: "Delivery", icon: MapPin },
                      { key: "pickup", label: "Pick up", icon: Store },
                    ] as const
                  ).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDeliveryMethod(key as DeliveryMethod)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                        deliveryMethod === key
                          ? "border-primary bg-primary/10"
                          : "bg-background hover:bg-accent/10",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact details */}
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-semibold">Contact details</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Full name
                    </label>
                    <Input
                      className={cn(
                        errors.customerName && "border-destructive",
                      )}
                      placeholder="e.g. Kwame Mensah"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    {errors.customerName && (
                      <p className="text-xs text-destructive">
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Phone number
                    </label>
                    <Input
                      className={cn(
                        errors.customerPhone && "border-destructive",
                      )}
                      placeholder="e.g. 024 000 0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                    {errors.customerPhone && (
                      <p className="text-xs text-destructive">
                        {errors.customerPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery address */}
                {deliveryMethod === "delivery" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Delivery location
                      </h3>
                      {deliveryLocation?.label ? (
                        <Badge variant="secondary" className="rounded-full">
                          Selected
                        </Badge>
                      ) : null}
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl border bg-background p-3",
                        errors.deliveryLocation && "border-destructive",
                      )}
                    >
                      <LocationPicker
                        value={deliveryLocation}
                        onChange={setDeliveryLocation}
                      />
                    </div>

                    {errors.deliveryLocation && (
                      <p className="text-xs text-destructive">
                        {errors.deliveryLocation}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Tip: choose a landmark and add a short note like "blue
                      gate, opposite the pharmacy".
                    </p>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="rounded-2xl bg-muted/40 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Payment on delivery / pick-up</p>
                  <p className="text-muted-foreground">
                    You are confirming the order details only.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: Cart summary card */}
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

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {deliveryMethod === "delivery"
                        ? formatGhs(deliveryFee)
                        : "Free"}
                    </span>
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
                      Placing order…
                    </>
                  ) : (
                    <>Place order • {formatGhs(total)}</>
                  )}
                </Button>

                <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 mt-0.5" />
                  <p>
                    Secure checkout. Your details are used only to prepare and
                    deliver your order.
                  </p>
                </div>
              </div>
            </section>

            {/* Mobile: quick back link */}
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
