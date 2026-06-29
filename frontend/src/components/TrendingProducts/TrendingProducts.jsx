import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./TrendingProducts.css";

const money = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiFetch("/api/products?sort=newest&page_size=6")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <section className="tw">
      <div className="tw-inner">
        <div className="tw-head">
          <h2 className="tw-title">Trending This Week</h2>
          <Link className="tw-all" to="/collections/new-arrivals">
            Shop All Products
          </Link>
        </div>

        <div className="tw-grid">
          {products.map((p) => (
            <Link className="tw-card" to={`/products/${p.slug}`} key={p.id}>
              <img
                className="tw-thumb"
                src={p.image_url}
                alt={p.name}
                loading="lazy"
              />
              <div className="tw-info">
                <span className="tw-brand">{p.brand}</span>
                <span className="tw-name">{p.name}</span>
                <span className="tw-price">{money(p.price)}</span>
              </div>
              <span className="tw-arrow" aria-hidden="true">
                <i className="fa-solid fa-chevron-right"></i>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
