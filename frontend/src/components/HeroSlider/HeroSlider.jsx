import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./HeroSlider.css";

const slides = [
  {
    id: 1,
    badge: "Drop Alert",
    title: "DROP ALERT",
    text: "Fresh Michigan and Villanova styles from Pro Standard and Johnnie-O.",
    emphasis: ["Michigan", "Villanova", "Pro Standard", "Johnnie-O"],
    cta: "Shop the Drop",
    href: "#drop",
    theme: "#0d2343",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: 2,
    badge: "Just In",
    title: "NEW ARRIVALS",
    text: "Gear up for the season with the latest officially licensed campus styles.",
    emphasis: ["officially licensed"],
    cta: "Shop New",
    href: "#new",
    theme: "#6d1f2b",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: 3,
    badge: "Game Day",
    title: "GAME DAY READY",
    text: "Tees, hoodies, and accessories for every fan, every team, every weekend.",
    emphasis: ["every fan"],
    cta: "Shop All",
    href: "#gameday",
    theme: "#14342b",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1100&q=80",
  },
  {
    id: 4,
    badge: "Gifts",
    title: "GIFTS FOR GRADS",
    text: "Celebrate the Class of 2026 with the perfect campus gift.",
    emphasis: ["Class of 2026"],
    cta: "Shop Gifts",
    href: "#gifts",
    theme: "#2a1a4a",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1100&q=80",
  },
];

const SHOP_PATH = "/collections/all-products";

// Wrap any emphasized phrases in <strong> for the bold-brand look in the copy.
const emphasize = (text, words = []) => {
  if (!words.length) return text;
  const re = new RegExp(`(${words.join("|")})`, "g");
  return text.split(re).map((part, i) =>
    words.includes(part) ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
};

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback((i) => setCurrent(((i % count) + count) % count), [count]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="hero-inner">
        <div className="hero-viewport">
          <div
            className="hero-track"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((s) => (
              <Link
                className="hero-slide"
                key={s.id}
                to={SHOP_PATH}
                style={{ "--panel": s.theme }}
              >
                <div className="hero-copy">
                  {s.badge && <span className="hero-badge">{s.badge}</span>}
                  <h2 className="hero-title">{s.title}</h2>
                  <p className="hero-text">{emphasize(s.text, s.emphasis)}</p>
                  <span className="hero-cta">
                    {s.cta}
                  </span>
                </div>
                <div className="hero-media">
                  <img src={s.image} alt="" loading="lazy" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="hero-controls">
          <button
            type="button"
            className="hero-arrow"
            onClick={prev}
            aria-label="Previous slide"
          >
            &#8249;
          </button>
          <div className="hero-dots">
            {slides.map((s, i) => (
              <button
                type="button"
                key={s.id}
                className={`hero-dot ${i === current ? "is-active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-arrow"
            onClick={next}
            aria-label="Next slide"
          >
            &#8250;
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
