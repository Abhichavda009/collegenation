import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";
import "./UniversityPage.css";

const departmentImage = (products, matcher) =>
  products.find((p) => matcher(p))?.image_url || products[0]?.image_url || "";

const fanTitle = (name) => `University of ${name}`;

const UniversityPage = () => {
  const { slug } = useParams();
  const [universities, setUniversities] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiFetch("/api/universities")
      .then((r) => r.json())
      .then(setUniversities)
      .catch(() => setUniversities([]));
  }, []);

  const university = useMemo(
    () => universities.find((u) => u.slug === slug),
    [slug, universities]
  );

  useEffect(() => {
    if (!university) return;

    apiFetch(
      `/api/products?university=${encodeURIComponent(university.name)}&page_size=12`
    )
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, [university]);

  if (!university) {
    return (
      <>
        <Header showUniversityTray={false} />
        <main className="upg-state">Loading university...</main>
        <Footer />
      </>
    );
  }

  const base = `/collections/all-products?university=${encodeURIComponent(
    university.name
  )}`;
  const shortcuts = [
    {
      label: "Shop All",
      to: base,
      logo: true,
    },
    {
      label: "New Arrivals",
      to: `${base}&sort=newest`,
      image: departmentImage(products, (p) => p.is_best_seller || p.department),
    },
    {
      label: "Men's",
      to: `${base}&gender=Men`,
      image: departmentImage(products, (p) => p.gender === "Men"),
    },
    {
      label: "Women's",
      to: `${base}&gender=Women`,
      image: departmentImage(products, (p) => p.gender === "Women"),
    },
    {
      label: "Hats",
      to: `${base}&category=hats`,
      image: departmentImage(products, (p) => p.category_slug === "hats"),
    },
  ];

  const featureProducts = products.slice(0, 3);

  return (
    <>
      <Header showUniversityTray={false} />

      <main className="upg">
        <section className="upg-hero">
          <h1>{fanTitle(university.name)}</h1>
          <p>Fan Gear</p>
        </section>

        <nav className="upg-shortcuts" aria-label={`${university.name} categories`}>
          {shortcuts.map((item) => (
            <Link to={item.to} className="upg-shortcut" key={item.label}>
              {item.logo ? (
                <span
                  className="upg-shortcut-logo"
                  style={{ backgroundColor: university.primary_color }}
                >
                  <span style={{ color: university.logo_color }}>{university.logo}</span>
                </span>
              ) : (
                <span className="upg-shortcut-img">
                  {item.image ? <img src={item.image} alt="" /> : null}
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <section className="upg-tiles">
          <Link to={`${base}&sort=newest`} className="upg-promo upg-promo-copy">
            <h2>
              <span>Back</span>
              <span>in Action</span>
            </h2>
          </Link>

          {featureProducts.map((product) => (
            <Link
              to={`/products/${product.slug}`}
              className="upg-product-tile"
              key={product.id}
            >
              <img src={product.image_url} alt={product.name} />
            </Link>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default UniversityPage;
