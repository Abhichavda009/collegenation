import React from "react";
import "./PromoTiles.css";

const tiles = [
  {
    id: 1,
    lines: ["BEST", "SELLERS"],
    href: "#best-sellers",
    alt: "Best sellers",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    lines: ["WINNING", "OUTERWEAR"],
    href: "#outerwear",
    alt: "Winning outerwear",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80",
  },
];

const PromoTiles = () => (
  <section className="pt">
    <div className="pt-grid">
      {tiles.map((t) => (
        <a className="pt-tile" href={t.href} key={t.id}>
          <img className="pt-img" src={t.image} alt={t.alt} loading="lazy" />
          <div className="pt-content">
            <h2 className="pt-title">
              {t.lines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </h2>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default PromoTiles;
