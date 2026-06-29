import React, { useState } from "react";
import "./ShopByCollection.css";

const thumbs = [
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
];

const collections = [
  {
    id: "mens",
    label: "Men's",
    title: "MEN'S",
    href: "#collections-mens",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=80",
    thumbs,
  },
  {
    id: "womens",
    label: "Women's",
    title: "WOMEN'S",
    href: "#collections-womens",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1100&q=80",
    thumbs: [thumbs[3], thumbs[2], thumbs[1], thumbs[0]],
  },
  {
    id: "kids",
    label: "Kids",
    title: "KIDS",
    href: "#collections-kids",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1100&q=80",
    thumbs: [thumbs[2], thumbs[0], thumbs[3], thumbs[1]],
  },
];

const ShopByCollection = () => {
  const [active, setActive] = useState("mens");
  const current = collections.find((c) => c.id === active);

  return (
    <section className="sbc">
      <div className="sbc-inner">
        <div className="sbc-left">
          <span className="sbc-eyebrow">Shop By Collection</span>

          <div className="sbc-tabs" role="tablist">
            {collections.map((c) => (
              <button
                type="button"
                key={c.id}
                role="tab"
                aria-selected={c.id === active}
                className={`sbc-tab${c.id === active ? " is-active" : ""}`}
                onClick={() => setActive(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="sbc-thumbs">
            {current.thumbs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="sbc-thumb"
                loading="lazy"
              />
            ))}
          </div>

          <p className="sbc-desc">
            Find your <strong>fit</strong> by <strong>Collections</strong> that
            match your campus life.
          </p>

          <a href={current.href} className="sbc-btn">
            Shop Now
          </a>
        </div>

        <a href={current.href} className="sbc-media">
          <img src={current.image} alt={`${current.label} collection`} />
          <span className="sbc-overlay">
            <span className="sbc-overlay-title">{current.title}</span>
            <span className="sbc-overlay-script">Collection</span>
          </span>
        </a>
      </div>
    </section>
  );
};

export default ShopByCollection;
