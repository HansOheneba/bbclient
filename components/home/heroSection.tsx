"use client";

import { useState, useEffect, useRef } from "react";

type Slide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  accent: string;
};

const slides: Slide[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1692783029695-1956cd253e10?q=80&w=1227&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Matcha Bliss",
    subtitle: "Ever Tasted the Bliss in Bubbles?",
    description:
      "Stone-ground ceremonial matcha whisked with oat milk, a touch of honey, and our signature tapioca pearls. Each sip is earthy, creamy, and impossibly smooth.",
    ctaText: "Order Yours",
    accent: "#065f46",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1600773407745-8eaa1937e802?q=80&w=1354&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Strawberry Dream",
    subtitle: "Ever Tasted the Bliss in Bubbles?",
    description:
      "Real blended strawberries, fresh cream, and chewy pearls that pop with every sip. It's summer in a cup — fruity, refreshing, and dangerously drinkable.",
    ctaText: "Sip the Dream",
    accent: "#be185d",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1600340432752-a407bab94cc3?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Chocolate Crush",
    subtitle: "Ever Tasted the Bliss in Bubbles?",
    description:
      "Belgian cocoa blended with whole milk, a pinch of sea salt, and our chewy black pearls. Indulgent doesn't even begin to cover it — this one's a full-on obsession.",
    ctaText: "Get Obsessed",
    accent: "#7c2d12",
  },
];

const AUTOPLAY_INTERVAL = 5000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [textKey, setTextKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number) => {
    if (animating || index === current) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(index);
    setTextKey((k) => k + 1);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 900);
  };

  const next = () => goTo((current + 1) % slides.length);
  const previous = () => goTo((current - 1 + slides.length) % slides.length);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isPaused) next();
    }, AUTOPLAY_INTERVAL);
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrent((c) => {
          const nextIdx = (c + 1) % slides.length;
          setAnimating(true);
          setPrev(c);
          setTextKey((k) => k + 1);
          setTimeout(() => {
            setPrev(null);
            setAnimating(false);
          }, 900);
          return nextIdx;
        });
      }, AUTOPLAY_INTERVAL);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  const slide = slides[current];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=DM+Sans:wght@300;400;500&display=swap');

        .hero-root {
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* Slide images */
        .slide-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .slide-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .slide-bg.visible { opacity: 1; }
        .slide-bg.hidden-slide { opacity: 0; }

        /* Overlay gradient */
        .slide-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            105deg,
            rgba(0,0,0,0.82) 0%,
            rgba(0,0,0,0.55) 45%,
            rgba(0,0,0,0.15) 100%
          );
        }

        /* Noise texture */
        .noise {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
        }

        /* Bubble decorations */
        .bubbles {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
        }
        .bubble {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.08);
          animation: floatBubble linear infinite;
        }
        @keyframes floatBubble {
          0% { transform: translateY(110vh) scale(0.6); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-20vh) scale(1.1); opacity: 0; }
        }

        /* Content layout */
        .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100svh;
          padding: 6rem 2rem 8rem;
          max-width: 80rem;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .hero-content { padding: 6rem 5rem 8rem; }
        }

        /* Tagline pill */
        .tagline-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          padding: 0.35rem 1rem;
          color: rgba(255,255,255,0.85);
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          width: fit-content;
        }
        .tagline-pill .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        /* Text animations */
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .text-animate-1 { animation: slideUpFade 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .text-animate-2 { animation: slideUpFade 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .text-animate-3 { animation: fadeInUp 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both; }
        .text-animate-4 { animation: fadeInUp 0.6s 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .text-animate-5 { animation: fadeInUp 0.6s 0.44s cubic-bezier(0.22,1,0.36,1) both; }

        /* Headings */
        .hero-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 900;
          line-height: 1.0;
          color: #fff;
          margin: 0;
        }
        .hero-subtitle {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1rem, 2.5vw, 1.4rem);
          font-weight: 300;
          font-style: italic;
          color: rgba(255,255,255,0.6);
          margin: 0.5rem 0 0;
        }
        .hero-description {
          max-width: 38ch;
          font-size: clamp(0.9rem, 1.5vw, 1rem);
          line-height: 1.75;
          color: rgba(255,255,255,0.72);
          margin-top: 1.5rem;
        }

        /* CTA button */
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 2rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.95rem;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .cta-btn:hover { transform: translateY(-2px) scale(1.03); opacity: 0.92; }
        .cta-btn:active { transform: scale(0.98); }

        /* Nav arrows */
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.18); transform: translateY(-50%) scale(1.08); }
        .nav-btn.left { left: 1.25rem; }
        .nav-btn.right { right: 1.25rem; }
        @media (min-width: 768px) {
          .nav-btn.left { left: 2rem; }
          .nav-btn.right { right: 2rem; }
        }

        /* Progress / indicators */
        .indicators {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .indicator-track {
          width: 2.5rem;
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          overflow: hidden;
          position: relative;
        }
        .indicator-track.active { width: 4rem; }
        .indicator-fill {
          position: absolute;
          inset: 0;
          border-radius: 99px;
          background: #fff;
          transform: scaleX(0);
          transform-origin: left;
        }
        .indicator-track.active .indicator-fill {
          animation: progress linear forwards;
          animation-duration: ${AUTOPLAY_INTERVAL}ms;
        }
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        /* Pause button */
        .pause-btn {
          position: absolute;
          bottom: 2.2rem;
          right: 1.5rem;
          z-index: 20;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          transition: background 0.2s;
        }
        .pause-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }

        /* Slide counter */
        .slide-counter {
          position: absolute;
          top: 2rem;
          right: 1.5rem;
          z-index: 20;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em;
        }
        @media (min-width: 768px) { .slide-counter { right: 2.5rem; } }
      `}</style>

      <section className="hero-root">
        {/* Slide backgrounds */}
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`slide-bg ${i === current ? "visible" : "hidden-slide"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt={s.title} />
          </div>
        ))}

        {/* Prev slide fading out */}
        {prev !== null && (
          <div className="slide-bg hidden-slide" style={{ zIndex: -1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slides[prev].image} alt={slides[prev].title} />
          </div>
        )}

        <div className="slide-overlay" />
        <div className="noise" />

        {/* Floating bubbles */}
        <div className="bubbles" aria-hidden="true">
          {[
            { size: 28, left: "8%", dur: 14, delay: 0 },
            { size: 18, left: "20%", dur: 18, delay: 3 },
            { size: 40, left: "35%", dur: 22, delay: 6 },
            { size: 14, left: "55%", dur: 16, delay: 1 },
            { size: 32, left: "70%", dur: 20, delay: 8 },
            { size: 22, left: "85%", dur: 13, delay: 4 },
            { size: 10, left: "92%", dur: 17, delay: 2 },
          ].map((b, i) => (
            <span
              key={i}
              className="bubble"
              style={{
                width: b.size,
                height: b.size,
                left: b.left,
                animationDuration: `${b.dur}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="slide-counter">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </div>

        {/* Main content */}
        <div className="hero-content">
          <div style={{ maxWidth: "42rem" }}>
         

            <div style={{ marginTop: "1.5rem" }}>
              <p
                className="hero-subtitle text-animate-2"
                key={`sub-${textKey}`}
              >
                {slide.subtitle}
              </p>
              <h1
                className="hero-title text-animate-1"
                key={`title-${textKey}`}
              >
                {slide.title}
              </h1>
            </div>

            <p
              className="hero-description text-animate-3"
              key={`desc-${textKey}`}
            >
              {slide.description}
            </p>

            <div
              className="text-animate-4"
              key={`cta-${textKey}`}
              style={{ marginTop: "2rem" }}
            >
              <button
                className="cta-btn"
                style={{ backgroundColor: slide.accent }}
              >
                {slide.ctaText}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Drink selector thumbnails */}
            <div
              className="text-animate-5"
              key={`thumbs-${textKey}`}
              style={{
                marginTop: "3rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginRight: "0.25rem",
                }}
              >
                Also try
              </span>
              {slides
                .filter((_, i) => i !== current)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      goTo(slides.indexOf(s));
                      resetTimer();
                    }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid rgba(255,255,255,0.18)",
                      cursor: "pointer",
                      transition: "transform 0.2s, border-color 0.2s",
                      padding: 0,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.12)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                    aria-label={`View ${s.title}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Prev arrow */}
        <button
          className="nav-btn left"
          onClick={() => {
            previous();
            resetTimer();
          }}
          aria-label="Previous slide"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          className="nav-btn right"
          onClick={() => {
            next();
            resetTimer();
          }}
          aria-label="Next slide"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Progress indicators */}
        <div className="indicators" role="group" aria-label="Slides">
          {slides.map((s, i) => (
            <div
              key={`${s.id}-${textKey}`}
              className={`indicator-track ${i === current ? "active" : ""}`}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              role="button"
              aria-label={`Go to slide ${i + 1}`}
              tabIndex={0}
            >
              <div className="indicator-fill" />
            </div>
          ))}
        </div>

        {/* Pause / Play */}
        <button
          className="pause-btn"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Play carousel" : "Pause carousel"}
          aria-pressed={isPaused}
        >
          {isPaused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      </section>
    </>
  );
}
