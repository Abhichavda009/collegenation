import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";
import "./CollectionPage.css";

const CATEGORY_NAMES = {
  "new-arrivals": "New Arrivals",
  "best-sellers": "Best Sellers",
  "all-products": "All Products",
  mens: "Men's",
  womens: "Women's",
  kids: "Kids",
  hats: "Accessories",
  gifts: "Gifts",
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Alphabetical: A-Z" },
];

// facet key -> query param name + sidebar label, in the reference order
const FACETS = [
  { key: "colors", param: "color", label: "Color" },
  { key: "sizes", param: "size", label: "Size" },
  { key: "genders", param: "gender", label: "Gender" },
  { key: "departments", param: "department", label: "Department" },
  { key: "universities", param: "university", label: "University" },
  { key: "brands", param: "brand", label: "Brand" },
];

const PAGE_SIZE = 24;

const money = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Accordion({ title, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cp-acc">
      <button
        type="button"
        className="cp-acc-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>
          {title}
          {count ? <span className="cp-acc-count"> ({count})</span> : null}
        </span>
        <i className={`fa-solid fa-${open ? "minus" : "plus"}`}></i>
      </button>
      {open && <div className="cp-acc-body">{children}</div>}
    </div>
  );
}

const CollectionPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isNewArrivals = slug === "new-arrivals";
  const isBestSellers = slug === "best-sellers";
  const isAllProducts = slug === "all-products";
  const isVirtual = isNewArrivals || isBestSellers || isAllProducts; // not a real category
  const categoryName = CATEGORY_NAMES[slug] || slug;

  const [facets, setFacets] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState({});
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);

  // When the category OR the URL query changes, initialise filters from the
  // URL (so a link like /collections/all-products?department=Outerwear opens
  // pre-filtered) and load the facet list.
  const spString = searchParams.toString();
  useEffect(() => {
    const next = {};
    FACETS.forEach((f) => {
      const vals = searchParams.getAll(f.param);
      if (vals.length) next[f.param] = vals;
    });
    setSelected(next);
    setPriceMin(searchParams.get("min_price") || "");
    setPriceMax(searchParams.get("max_price") || "");
    setInStockOnly(searchParams.get("in_stock") === "true");
    setSort(
      searchParams.get("sort") ||
        (isBestSellers ? "best-selling" : isNewArrivals ? "newest" : "featured")
    );
    setPage(1);

    const facetUrl = isBestSellers
      ? `/api/filters?best_seller=true`
      : isVirtual
      ? `/api/filters`
      : `/api/filters?category=${slug}`;
    apiFetch(facetUrl)
      .then((r) => r.json())
      .then(setFacets)
      .catch(() => setFacets(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, spString]);

  const buildParams = useCallback(
    (pageNum) => {
      const params = new URLSearchParams();
      if (!isVirtual) params.set("category", slug);
      if (isBestSellers) params.set("best_seller", "true");
      Object.entries(selected).forEach(([param, values]) =>
        (values || []).forEach((v) => params.append(param, v))
      );
      if (priceMin) params.set("min_price", priceMin);
      if (priceMax) params.set("max_price", priceMax);
      if (inStockOnly) params.set("in_stock", "true");
      params.set("sort", sort);
      params.set("page", pageNum);
      params.set("page_size", PAGE_SIZE);
      return params;
    },
    [slug, isVirtual, isBestSellers, selected, priceMin, priceMax, inStockOnly, sort]
  );

  // Fetch products whenever the query changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch(`/api/products?${buildParams(page)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setTotal(data.total);
        setProducts((prev) =>
          page === 1 ? data.products : [...prev, ...data.products]
        );
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [buildParams, page]);

  const toggle = (param, value) => {
    setPage(1);
    setSelected((prev) => {
      const cur = prev[param] || [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...prev, [param]: next };
    });
  };

  const isChecked = (param, value) => (selected[param] || []).includes(value);

  const activeCount =
    Object.values(selected).reduce((n, v) => n + (v ? v.length : 0), 0) +
    (inStockOnly ? 1 : 0) +
    (priceMin || priceMax ? 1 : 0);

  const clearAll = () => {
    setSelected({});
    setPriceMin("");
    setPriceMax("");
    setInStockOnly(false);
    setPage(1);
  };

  const facetItems = (key) => (facets && facets[key]) || [];

  // Removable filter chips (mirrors the applied filters)
  const chips = [];
  Object.entries(selected).forEach(([param, vals]) =>
    (vals || []).forEach((v) =>
      chips.push({ label: v, onRemove: () => toggle(param, v) })
    )
  );
  if (priceMin || priceMax) {
    chips.push({
      label: `$${priceMin || 0} – $${priceMax || "∞"}`,
      onRemove: () => {
        setPriceMin("");
        setPriceMax("");
        setPage(1);
      },
    });
  }
  if (inStockOnly) {
    chips.push({
      label: "In stock",
      onRemove: () => {
        setInStockOnly(false);
        setPage(1);
      },
    });
  }

  return (
    <>
      <Header />

      <div className="cp">
        <div className="cp-inner">
          {/* Breadcrumb */}
          <nav className="cp-crumbs">
            <Link to="/">Home</Link>
            <span className="cp-sep">|</span>
            <span>Collection</span>
            <span className="cp-sep">|</span>
            <span className="cp-crumb-active">{categoryName}</span>
          </nav>

          <h1 className="cp-title">{categoryName}</h1>

          {/* Toolbar */}
          <div className="cp-toolbar">
            <div className="cp-toolbar-left">
              <span className="cp-filter-pill">
                <i className="fa-solid fa-sliders"></i> Filter
              </span>
              <span className="cp-count">{total} products</span>
              {activeCount > 0 && (
                <button type="button" className="cp-clear" onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>

            <div className="cp-toolbar-right">
              <label className="cp-sort">
                Sort by:
                <select
                  value={sort}
                  onChange={(e) => {
                    setPage(1);
                    setSort(e.target.value);
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="cp-view">
                <span className="cp-view-label">View as</span>
                <button
                  type="button"
                  className={`cp-view-btn ${view === "grid" ? "is-active" : ""}`}
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                >
                  <i className="fa-solid fa-table-cells"></i>
                </button>
                <button
                  type="button"
                  className={`cp-view-btn ${view === "list" ? "is-active" : ""}`}
                  onClick={() => setView("list")}
                  aria-label="List view"
                >
                  <i className="fa-solid fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="cp-chips">
              {chips.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  className="cp-chip"
                  onClick={c.onRemove}
                >
                  {c.label} <span className="cp-chip-x">×</span>
                </button>
              ))}
            </div>
          )}

          <div className="cp-body">
            {/* Sidebar filters */}
            <aside className="cp-sidebar">
              {FACETS.map((f) => (
                <Accordion key={f.key} title={f.label}>
                  <ul className="cp-opts">
                    {facetItems(f.key).map((opt) => (
                      <li key={opt.value}>
                        <label className="cp-opt">
                          <input
                            type="checkbox"
                            checked={isChecked(f.param, opt.value)}
                            onChange={() => toggle(f.param, opt.value)}
                          />
                          <span className="cp-opt-name">{opt.value}</span>
                          <span className="cp-opt-count">{opt.count}</span>
                        </label>
                      </li>
                    ))}
                    {facetItems(f.key).length === 0 && (
                      <li className="cp-opt-empty">No options</li>
                    )}
                  </ul>
                </Accordion>
              ))}

              {/* Price */}
              <Accordion title="Price">
                <div className="cp-price">
                  <input
                    type="number"
                    placeholder={facets ? `${facets.price.min}` : "Min"}
                    value={priceMin}
                    onChange={(e) => {
                      setPage(1);
                      setPriceMin(e.target.value);
                    }}
                  />
                  <span>–</span>
                  <input
                    type="number"
                    placeholder={facets ? `${facets.price.max}` : "Max"}
                    value={priceMax}
                    onChange={(e) => {
                      setPage(1);
                      setPriceMax(e.target.value);
                    }}
                  />
                </div>
              </Accordion>

              {/* Availability */}
              <Accordion title="Availability">
                <label className="cp-opt">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => {
                      setPage(1);
                      setInStockOnly((v) => !v);
                    }}
                  />
                  <span className="cp-opt-name">In stock only</span>
                </label>
              </Accordion>
            </aside>

            {/* Product grid */}
            <div className="cp-results">
              {loading && page === 1 ? (
                <div className="cp-state">Loading products…</div>
              ) : products.length === 0 ? (
                <div className="cp-state">No products match your filters.</div>
              ) : (
                <>
                  <div className={`cp-grid ${view === "list" ? "is-list" : ""}`}>
                    {products.map((p) => (
                      <Link
                        className="cp-card"
                        to={`/products/${p.slug}`}
                        key={p.id}
                      >
                        <div className="cp-card-media">
                          {!p.in_stock ? (
                            <span className="cp-badge cp-badge-out">
                              Out of Stock
                            </span>
                          ) : p.compare_at_price ? (
                            <span className="cp-badge cp-badge-sale">Sale</span>
                          ) : p.is_best_seller ? (
                            <span className="cp-badge cp-badge-best">
                              Best Seller
                            </span>
                          ) : null}
                          <img src={p.image_url} alt={p.name} loading="lazy" />
                        </div>
                        <div className="cp-card-info">
                          <span className="cp-card-brand">{p.brand}</span>
                          <span className="cp-card-name">{p.name}</span>
                          <span
                            className={`cp-card-price${
                              p.compare_at_price ? " is-sale" : ""
                            }`}
                          >
                            {money(p.price)}
                            {p.compare_at_price && (
                              <span className="cp-card-was">
                                {money(p.compare_at_price)}
                              </span>
                            )}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {products.length < total && (
                    <div className="cp-more-wrap">
                      <button
                        type="button"
                        className="cp-more"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={loading}
                      >
                        {loading ? "Loading…" : "Load more"}
                      </button>
                      <p className="cp-more-info">
                        Showing {products.length} of {total}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CollectionPage;
