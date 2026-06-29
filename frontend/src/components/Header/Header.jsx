import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import './Header.css';

const CART_KEY = 'cn_cart';
const FREE_SHIPPING_TARGET = 45;

const money = (n) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

const CONFERENCES = [
  { key: 'ACC', mark: 'ACC', schools: ['Clemson', 'Syracuse', 'Virginia'] },
  { key: 'Big Ten', mark: 'B1G', schools: ['Maryland', 'Michigan', 'UCLA', 'Washington'] },
  { key: 'Big 12', mark: 'XII', schools: ['Arizona', 'Kansas', 'TCU'] },
  { key: 'Big East', mark: 'BIG EAST', schools: ['Villanova'] },
  { key: 'SEC', mark: 'SEC', schools: ['Alabama', 'LSU', 'Missouri', 'Tennessee'] },
];

const displayUniversityName = (name) => (name === 'Virginia' ? 'UVA' : name);

const Header = ({ showUniversityTray = true }) => {
  const [universities, setUniversities] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [universityMenuOpen, setUniversityMenuOpen] = useState(false);
  const [activeConference, setActiveConference] = useState(CONFERENCES[0].key);

  useEffect(() => {
    apiFetch('/api/universities')
      .then((r) => r.json())
      .then(setUniversities)
      .catch(() => setUniversities([]));
  }, []);

  useEffect(() => {
    const syncLogin = () => {
      setIsLoggedIn(localStorage.getItem('cn_logged_in') === 'true');
    };

    syncLogin();
    window.addEventListener('storage', syncLogin);
    window.addEventListener('focus', syncLogin);

    return () => {
      window.removeEventListener('storage', syncLogin);
      window.removeEventListener('focus', syncLogin);
    };
  }, []);

  useEffect(() => {
    const syncCart = () => setCartItems(readCart());

    syncCart();
    window.addEventListener('storage', syncCart);
    window.addEventListener('focus', syncCart);
    window.addEventListener('cn_cart_updated', syncCart);

    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('focus', syncCart);
      window.removeEventListener('cn_cart_updated', syncCart);
    };
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cn_cart_updated'));
  };

  const updateQty = (key, delta) => {
    saveCart(
      cartItems
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
    );
  };

  const removeItem = (key) => {
    saveCart(cartItems.filter((item) => item.key !== key));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const freeShippingLeft = Math.max(0, FREE_SHIPPING_TARGET - cartTotal);
  const shippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_TARGET) * 100);
  const universitiesByName = universities.reduce((acc, uni) => {
    acc[uni.name] = uni;
    return acc;
  }, {});
  const activeConferenceData =
    CONFERENCES.find((conference) => conference.key === activeConference) || CONFERENCES[0];
  const activeUniversities = activeConferenceData.schools
    .map((name) => universitiesByName[name])
    .filter(Boolean);

  return (
    <>
      {/* Include FontAwesome Icon stylesheet dynamically */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />

      <header className="cn-global-header">
        {/* Row 1: Banner */}
        <div className="cn-top-banner">
          <div className="cn-container">
            <span className="cn-banner-text">Free Shipping on orders over $45</span>
            <i className="fa-brands fa-instagram cn-insta-icon"></i>
          </div>
        </div>

        {/* Sticky bar: logo/search row + category links stay pinned on scroll */}
        <div className="cn-sticky-bar">

        {/* Row 2: Mid-Section Logo & Search */}
        <div className="cn-mid-section">
          <div className="cn-container">
            {/* College Nation shield crest */}
            <Link to="/" className="cn-brand-logo" aria-label="College Nation - Home">
              <svg
                className="cn-logo-svg"
                viewBox="0 0 120 134"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="College Nation"
              >
                <defs>
                  <path id="cnArc" d="M14,48 A54,42 0 0 1 106,48" fill="none" />
                </defs>

                {/* Arched brand name */}
                <text className="cn-logo-arc-text" textAnchor="middle">
                  <textPath href="#cnArc" startOffset="50%">
                    COLLEGE&#160;&#160;NATION
                  </textPath>
                </text>

                {/* Shield body */}
                <path
                  d="M20,52 H100 V78 C100,102 82,120 60,130 C38,120 20,102 20,78 Z"
                  fill="#cf242a"
                  stroke="#0d2343"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                {/* Navy top band */}
                <path d="M22,54 H98 V68 H22 Z" fill="#0d2343" />

                {/* CN monogram */}
                <text x="60" y="98" className="cn-logo-monogram" textAnchor="middle">
                  CN
                </text>

                {/* Columns / campus building icon */}
                <g fill="#ffffff">
                  <path d="M47,104 L60,98 L73,104 Z" />
                  <rect x="47" y="105" width="26" height="2.4" />
                  <rect x="49.5" y="108.5" width="3" height="8" />
                  <rect x="55" y="108.5" width="3" height="8" />
                  <rect x="62" y="108.5" width="3" height="8" />
                  <rect x="67.5" y="108.5" width="3" height="8" />
                  <rect x="47" y="117" width="26" height="2.4" />
                </g>
              </svg>
            </Link>

            {/* Search Elements */}
            <div className="cn-search-combo">
              <div className="cn-select-box">
                <button
                  type="button"
                  className="cn-university-trigger"
                  aria-expanded={universityMenuOpen}
                  onClick={() => setUniversityMenuOpen((open) => !open)}
                >
                  <span>All Universities</span>
                  <i className="fa-solid fa-chevron-down cn-select-arrow"></i>
                </button>
              </div>
              <div className="cn-input-box">
                <input type="text" placeholder="Try searching for Kansas Tees..." />
                <i className="fa-solid fa-magnifying-glass cn-search-glass"></i>
              </div>
              {universityMenuOpen && (
                <div className="cn-university-menu">
                  <div className="cn-conference-tabs">
                    {CONFERENCES.map((conference) => (
                      <button
                        type="button"
                        key={conference.key}
                        className={conference.key === activeConference ? 'is-active' : ''}
                        onClick={() => setActiveConference(conference.key)}
                      >
                        <span className={`cn-conf-mark cn-conf-${conference.key.toLowerCase().replace(/\s+/g, '-')}`}>
                          {conference.mark}
                        </span>
                        <span>{conference.key}</span>
                      </button>
                    ))}
                  </div>
                  <div className="cn-conference-schools">
                    {activeUniversities.map((uni) => (
                      <Link
                        to={`/universities/${uni.slug || uni.name.toLowerCase()}`}
                        className="cn-conference-school"
                        key={uni.slug || uni.name}
                        onClick={() => setUniversityMenuOpen(false)}
                      >
                        <span
                          className="cn-conference-school-logo"
                          style={{ backgroundColor: uni.primary_color }}
                        >
                          <span style={{ color: uni.logo_color }}>{uni.logo}</span>
                        </span>
                        <span>{displayUniversityName(uni.name)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account & Bag actions */}
            <div className="cn-user-bar">
              <Link to="/signin" className="cn-account-link">
                <i className="fa-regular fa-user cn-user-icon"></i>
                <span>{isLoggedIn ? 'Account' : 'Sign in'}</span>
              </Link>
              <button
                type="button"
                className="cn-bag-wrapper"
                aria-label="Open cart"
                onClick={() => setCartOpen(true)}
              >
                <i className="fa-solid fa-bag-shopping cn-bag-icon"></i>
                {cartCount > 0 && <span className="cn-bag-count">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Standard Links */}
        <nav className="cn-navbar-links">
          <div className="cn-container">
            <ul className="cn-nav-ul">
              <li><NavLink to="/collections/new-arrivals">New Arrivals</NavLink></li>
              <li><NavLink to="/collections/mens">Men's</NavLink></li>
              <li><NavLink to="/collections/womens">Women's</NavLink></li>
              <li><NavLink to="/collections/gifts">Gifts</NavLink></li>
              <li><NavLink to="/collections/hats">Accessories</NavLink></li>
              <li><NavLink to="/faq">Help</NavLink></li>
              <li><NavLink to="/contact">Contact</NavLink></li>
            </ul>
            <div className="cn-nav-store">
              <i className="fa-solid fa-location-dot cn-pin-icon"></i>
              <span>Find a Store</span>
            </div>
          </div>
        </nav>

        </div>{/* /cn-sticky-bar */}

        {/* Row 4: Horizontal University Lineup */}
        {showUniversityTray && (
          <div className="cn-uni-tray">
            <div className="cn-container">
              <div className="cn-uni-scroll">
                {universities.map((uni) => (
                  <Link
                    to={`/universities/${uni.slug || uni.name.toLowerCase()}`}
                    className="cn-uni-node"
                    key={uni.slug || uni.name}
                  >
                    <div className="cn-node-circle" style={{ backgroundColor: uni.primary_color }}>
                      <span style={{ color: uni.logo_color }}>{uni.logo}</span>
                    </div>
                    <span className="cn-node-name">{uni.name}</span>
                  </Link>
                ))}
              </div>
              <div className="cn-view-all-box">
                <Link to="/pages/universities" className="cn-view-all-anchor">View All</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {cartOpen && (
        <div className="cn-cart-layer" role="dialog" aria-modal="true" aria-label="Cart">
          <button
            type="button"
            className="cn-cart-backdrop"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          ></button>

          <aside className="cn-cart-drawer">
            <div className="cn-cart-head">
              <h2>Your Cart ({cartCount})</h2>
              <div className="cn-cart-head-actions">
                <button type="button" aria-label="Share cart">
                  <i className="fa-regular fa-share-from-square"></i>
                </button>
                <button type="button" aria-label="Close cart" onClick={() => setCartOpen(false)}>
                  &times;
                </button>
              </div>
            </div>

            {cartItems.length > 0 ? (
              <>
                <div className="cn-cart-free">
                  <span>
                    {freeShippingLeft > 0
                      ? `Spend ${money(freeShippingLeft)} more to reach free shipping!`
                      : 'You have free shipping!'}
                  </span>
                  <div className="cn-cart-progress">
                    <span style={{ width: `${shippingProgress}%` }}></span>
                  </div>
                </div>

                <div className="cn-cart-items">
                  {cartItems.map((item) => (
                    <div className="cn-cart-item" key={item.key}>
                      <Link to={`/products/${item.slug}`} onClick={() => setCartOpen(false)}>
                        <img src={item.image_url} alt={item.name} />
                      </Link>
                      <div className="cn-cart-item-info">
                        <div className="cn-cart-item-top">
                          <Link
                            to={`/products/${item.slug}`}
                            onClick={() => setCartOpen(false)}
                            className="cn-cart-item-name"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeItem(item.key)}
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                        <p>{item.color} / {item.sizeLabel}</p>
                        <div className="cn-cart-item-bottom">
                          <div className="cn-cart-qty">
                            <button type="button" onClick={() => updateQty(item.key, -1)}>
                              &minus;
                            </button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => updateQty(item.key, 1)}>
                              +
                            </button>
                          </div>
                          <strong>{money(Number(item.price) * item.quantity)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cn-cart-footer">
                  <div className="cn-cart-total">
                    <span>Estimated total</span>
                    <strong>{money(cartTotal)}</strong>
                  </div>
                  <p>Taxes and shipping calculated at checkout</p>
                  <a href="#shipping">Learn more about our Shipping Policies</a>
                  <div className="cn-cart-footer-actions">
                    <Link to="/cart" onClick={() => setCartOpen(false)}>
                      View Cart
                    </Link>
                    <Link
                      to="/checkout"
                      className="cn-cart-checkout-link"
                      onClick={() => setCartOpen(false)}
                    >
                      Checkout &rarr;
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="cn-cart-empty">
                <h3>Your cart is empty</h3>
                <p>Looks like you have not added anything yet.</p>
                <Link to="/collections/all-products" onClick={() => setCartOpen(false)}>
                  Shop now
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
