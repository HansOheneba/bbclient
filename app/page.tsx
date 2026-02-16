"use client";

import { useState } from "react";
import { products, getProductsByCategory, type Product } from "@/lib/products";

export default function Home() {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(
    [],
  );
  const [activeCategory, setActiveCategory] = useState<
    "boba" | "iced-tea" | "shawarma"
  >("boba");
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const filteredProducts = getProductsByCategory(activeCategory);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
  

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Hero Section */}
          <section
            className="py-20 px-4 text-center"
            style={{
              background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold text-white mb-4">
                Welcome to Bubble Bliss Cafe
              </h2>
              <p className="text-xl text-white/90 mb-8">
                ✨ Bubble Tea Paradise • 🥶 Refreshing Iced Tea • 🌯 Authentic
                Shawarma
              </p>
              <p className="text-white/80">
                Crafted with passion, served with joy. Experience pure bliss in
                every sip and bite.
              </p>
            </div>
          </section>

          {/* Category Tabs */}
          <div className="flex justify-center gap-4 py-12 px-4 flex-wrap">
            {(["boba", "iced-tea", "shawarma"] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeCategory === category
                    ? "text-white"
                    : "hover:opacity-80"
                }`}
                style={{
                  backgroundColor:
                    activeCategory === category
                      ? "var(--primary)"
                      : "var(--card)",
                  color:
                    activeCategory === category ? "white" : "var(--foreground)",
                  borderColor: "var(--border)",
                  border: activeCategory === category ? "none" : "1px solid",
                }}
              >
                {category === "boba" && "🧋 Boba Tea"}
                {category === "iced-tea" && "🥶 Iced Tea"}
                {category === "shawarma" && "🌯 Shawarma"}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="max-w-7xl mx-auto px-4 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition border-t-4"
                  style={{
                    backgroundColor: "var(--card)",
                    borderTopColor: "var(--accent)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="w-full h-48 bg-linear-to-br"
                    style={{
                      backgroundImage: `url(${product.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                  <div className="p-4">
                    <h3
                      className="font-bold text-lg mb-2"
                      style={{ color: "var(--white)" }}
                    >
                      {product.name}
                    </h3>
                    <p
                      style={{ color: "var(--muted-foreground)" }}
                      className="text-sm mb-4"
                    >
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--accent)" }}
                      >
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-4 py-2 rounded-lg text-white font-semibold transition hover:opacity-90"
                        style={{ backgroundColor: "var(--accent)" }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <section
            className="py-12 px-4"
            style={{ backgroundColor: "var(--card)" }}
          >
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-8"
                style={{ color: "var(--white)" }}
              >
                Why Choose Us?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="text-4xl mb-4">✨</div>
                  <h3
                    className="font-bold mb-2"
                    style={{ color: "var(--white)" }}
                  >
                    Premium Quality
                  </h3>
                  <p style={{ color: "var(--muted-foreground)" }}>
                    Fresh ingredients and authentic recipes
                  </p>
                </div>
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="text-4xl mb-4">⚡</div>
                  <h3
                    className="font-bold mb-2"
                    style={{ color: "var(--white)" }}
                  >
                    Quick Service
                  </h3>
                  <p style={{ color: "var(--muted-foreground)" }}>
                    Fast preparation and delivery
                  </p>
                </div>
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="text-4xl mb-4">😋</div>
                  <h3
                    className="font-bold mb-2"
                    style={{ color: "var(--white)" }}
                  >
                    Amazing Taste
                  </h3>
                  <p style={{ color: "var(--muted-foreground)" }}>
                    Flavors crafted to perfection
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div
            className="w-80 shadow-xl p-6 border-l"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: "var(--white)" }}
            >
              Shopping Cart
            </h2>
            {cart.length === 0 ? (
              <p
                style={{ color: "var(--muted-foreground)" }}
                className="text-center py-8"
              >
                Your cart is empty
              </p>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "var(--background)" }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3
                          className="font-semibold text-sm"
                          style={{ color: "var(--white)" }}
                        >
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 text-sm hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="rounded hover:opacity-80 transition w-6 h-6"
                            style={{
                              backgroundColor: "var(--primary)",
                              color: "var(--white)",
                            }}
                          >
                            -
                          </button>
                          <span style={{ color: "var(--foreground)" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="rounded hover:opacity-80 transition w-6 h-6"
                            style={{
                              backgroundColor: "var(--primary)",
                              color: "var(--white)",
                            }}
                          >
                            +
                          </button>
                        </div>
                        <span
                          className="font-bold"
                          style={{ color: "var(--accent)" }}
                        >
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="pt-4"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div className="flex justify-between mb-4">
                    <span
                      className="font-bold text-lg"
                      style={{ color: "var(--foreground)" }}
                    >
                      Total:
                    </span>
                    <span
                      className="font-bold text-2xl"
                      style={{ color: "var(--accent)" }}
                    >
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    className="w-full py-3 rounded-lg text-white font-bold transition hover:opacity-90"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
