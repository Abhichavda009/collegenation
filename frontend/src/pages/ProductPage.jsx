import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiFetch, assetUrl } from "../lib/api";
import "./ProductPage.css";

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

const SIZE_LABELS = {
  XS: "XSmall",
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "XLarge",
  XXL: "2XLarge",
  YS: "Youth S",
  YM: "Youth M",
  YL: "Youth L",
  OSFA: "One Size",
};

const money = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CART_KEY = "cn_cart";

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cn_cart_updated"));
};

const Shell = ({ children }) => (
  <>
    <Header />
    <div className="pd">
      <div className="pd-inner">{children}</div>
    </div>
    <Footer />
  </>
);

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setStatus("loading");
    setAdded(false);
    apiFetch(`/api/products/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((p) => {
        setProduct(p);
        setSize((p.sizes && p.sizes[0]) || null);
        setQty(1);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [slug]);

  if (status === "loading") {
    return (
      <Shell>
        <div className="pd-state">Loading…</div>
      </Shell>
    );
  }

  if (status === "error" || !product) {
    return (
      <Shell>
        <div className="pd-state">
          Product not found.{" "}
          <Link to="/collections/new-arrivals">Browse products</Link>
        </div>
      </Shell>
    );
  }

  const stock = product.stock;
  const max = stock > 0 ? stock : 1;
  const pct = Math.max(10, (Math.min(stock, 10) / 10) * 100);
  const swatch = COLOR_HEX[product.color] || "#999999";

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(max, q + 1));
  const addToCart = () => {
    const selectedSize = size || "OSFA";
    const itemKey = `${product.slug}-${selectedSize}`;
    const current = readCart();
    const existing = current.find((item) => item.key === itemKey);
    const next = existing
      ? current.map((item) =>
          item.key === itemKey
            ? { ...item, quantity: Math.min(item.quantity + qty, max) }
            : item
        )
      : [
          ...current,
          {
            key: itemKey,
            slug: product.slug,
            name: product.name,
            image_url: assetUrl(product.image_url),
            price: product.price,
            color: product.color,
            size: selectedSize,
            sizeLabel: SIZE_LABELS[selectedSize] || selectedSize,
            quantity: qty,
          },
        ];

    saveCart(next);
    setAdded(true);
  };

  return (
    <Shell>
      <nav className="pd-crumbs">
        <Link to="/">Home</Link>
        <span className="pd-sep">|</span>
        <Link to={`/collections/${product.category_slug}`}>
          Collection: {product.category}
        </Link>
        <span className="pd-sep">|</span>
        <span className="pd-crumb-active">{product.name}</span>
      </nav>

      <div className="pd-body">
        {/* Image */}
        <div className="pd-media">
          <button className="pd-zoom" aria-label="Zoom image">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          <img src={assetUrl(product.image_url)} alt={product.name} />
        </div>

        {/* Info */}
        <div className="pd-info">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-meta">
            <span>
              Vendor: <a href="#vendor">{product.brand}</a>
            </span>
            <span className="pd-meta-sep">|</span>
            <span>SKU: {product.sku}</span>
          </div>

          <div className="pd-price">{money(product.price)}</div>

          {stock === 0 ? (
            <p className="pd-stock pd-out">Out of stock</p>
          ) : (
            <>
              <p className="pd-stock">
                Hurry up, only <strong>{stock}</strong> items left in stock.
              </p>
              <div className="pd-bar">
                <span style={{ width: `${pct}%` }} />
              </div>
            </>
          )}

          {/* Color */}
          <div className="pd-opt">
            <span className="pd-opt-label">
              COLOR: <span className="pd-opt-value">{product.color}</span>
            </span>
            <div className="pd-swatches">
              <span
                className="pd-swatch is-active"
                style={{
                  backgroundColor: swatch,
                  borderColor: product.color === "White" ? "#ccc" : undefined,
                }}
              />
            </div>
          </div>

          {/* Size */}
          <div className="pd-opt">
            <span className="pd-opt-label">
              SIZE:{" "}
              <span className="pd-opt-value">
                {size ? SIZE_LABELS[size] || size : "-"}
              </span>
            </span>
            <div className="pd-sizes">
              {(product.sizes || []).map((s) => (
                <button
                  type="button"
                  key={s}
                  className={`pd-size ${s === size ? "is-active" : ""}`}
                  onClick={() => setSize(s)}
                >
                  {SIZE_LABELS[s] || s}
                </button>
              ))}
            </div>
            <a href="#size-chart" className="pd-sizechart">
              Size Chart
            </a>
          </div>

          {/* Actions */}
          <div className="pd-actions">
            <div className="pd-qty">
              <button type="button" onClick={dec} aria-label="Decrease quantity">
                &#8722;
              </button>
              <span>{qty}</span>
              <button type="button" onClick={inc} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button
              type="button"
              className="pd-add"
              disabled={stock === 0}
              onClick={addToCart}
            >
              Add To Cart
            </button>
          </div>

          {added && (
            <p className="pd-added">
              Added {qty} × {SIZE_LABELS[size] || size} to your cart.
            </p>
          )}

          <button type="button" className="pd-shop" disabled={stock === 0}>
            Buy with <span className="pd-shop-word">shop</span>
          </button>

          <a href="#more-payment" className="pd-link-center">
            More payment options
          </a>
          <a href="#shipping" className="pd-link-center pd-shipping">
            Shipping Details
          </a>

          <div className="pd-extra">
            <a href="#share">
              <i className="fa-solid fa-share-nodes"></i> Share
            </a>
            <a href="#ask">
              <i className="fa-regular fa-circle-question"></i> Ask a question
            </a>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default ProductPage;
