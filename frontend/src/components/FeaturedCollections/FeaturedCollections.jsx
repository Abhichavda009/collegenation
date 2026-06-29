import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiFetch, assetUrl } from "../../lib/api";
import "./FeaturedCollections.css";

const COLOR_HEX = {
  Navy: "#0d2343",
  Gray: "#d9d9d9",
  Black: "#111418",
  White: "#ffffff",
  Crimson: "#9e1b32",
  Orange: "#f56600",
  Purple: "#522d80",
  Blue: "#0051ba",
  Green: "#14532d",
  Red: "#e03a3e",
  Gold: "#f1b82d",
  Maroon: "#6d1f2b",
  Silver: "#c0c0c0",
};

const money = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const FeaturedCollections = () => {
  const trackRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [thumb, setThumb] = useState({ width: 30, left: 0 });

  useEffect(() => {
    apiFetch("/api/products?page_size=10")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, []);

  const updateProgress = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const ratio = el.clientWidth / el.scrollWidth;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    const widthPct = Math.min(ratio * 100, 100);
    setThumb({ width: widthPct, left: p * (100 - widthPct) });
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("resize", updateProgress);
    return () => window.removeEventListener("resize", updateProgress);
  }, [updateProgress, products]);

  const scrollByDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="fc">
      <div className="fc-inner">
        <h2 className="fc-heading">Featured Collections</h2>

        <div className="fc-track" ref={trackRef} onScroll={updateProgress}>
          {/* Promo card */}
          <Link to="/collections/new-arrivals" className="fc-promo">
            <span className="fc-promo-script">Shop</span>
            <span className="fc-promo-title">
              NEW
              <br />
              ARRIVALS
            </span>
          </Link>

          {products.map((p) => (
            <article className="fc-card" key={p.id}>
              <Link to={`/products/${p.slug}`} className="fc-card-media">
                {!p.in_stock && <span className="fc-badge">Sold Out</span>}
                <button
                  type="button"
                  className="fc-quickview"
                  aria-label="Quick view"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
                <img src={assetUrl(p.image_url)} alt={p.name} loading="lazy" />
                <span className="fc-choose">Choose Options</span>
              </Link>

              <div className="fc-card-body">
                <span className="fc-brand">{p.brand}</span>
                <Link to={`/products/${p.slug}`} className="fc-title">
                  {p.name}
                </Link>
                <div className="fc-price">
                  <span className="fc-price-now">{money(p.price)}</span>
                </div>
                <div className="fc-swatches">
                  <span
                    className="fc-swatch"
                    style={{ backgroundColor: COLOR_HEX[p.color] || "#999" }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="fc-footer">
          <div className="fc-progress">
            <span
              className="fc-progress-bar"
              style={{ width: `${thumb.width}%`, left: `${thumb.left}%` }}
            />
          </div>
          <div className="fc-nav">
            <button
              type="button"
              className="fc-arrow"
              onClick={() => scrollByDir(-1)}
              aria-label="Previous products"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="fc-arrow"
              onClick={() => scrollByDir(1)}
              aria-label="Next products"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
