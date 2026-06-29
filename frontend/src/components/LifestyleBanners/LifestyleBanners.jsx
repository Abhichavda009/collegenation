import React from "react";
import { Link } from "react-router-dom";
import "./LifestyleBanners.css";

const banners = [
  {
    id: 1,
    lines: [[{ t: "TOP OFF" }], [{ t: "YOUR " }, { t: "Look", s: true }]],
    desc: "Cool, comfy hats that elevate your fitness game.",
    to: "/collections/all-products",
    alt: "Shop hats",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    lines: [[{ t: "SHOP " }, { t: "Gifts", s: true }]],
    desc: "Give the gift that reps their roots.",
    to: "/collections/all-products",
    alt: "Shop gifts",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
  },
];

const LifestyleBanners = () => (
  <section className="lb">
    <div className="lb-grid">
      {banners.map((b) => (
        <Link className="lb-banner" to={b.to} key={b.id}>
          <div className="lb-copy">
            <h2 className="lb-title">
              {b.lines.map((line, i) => (
                <span className="lb-line" key={i}>
                  {line.map((seg, j) =>
                    seg.s ? (
                      <span className="lb-script" key={j}>
                        {seg.t}
                      </span>
                    ) : (
                      <span key={j}>{seg.t}</span>
                    )
                  )}
                </span>
              ))}
            </h2>
            <p className="lb-desc">{b.desc}</p>
          </div>
          <img className="lb-img" src={b.image} alt={b.alt} loading="lazy" />
        </Link>
      ))}
    </div>
  </section>
);

export default LifestyleBanners;
