import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import './Header.css';

const Header = () => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    apiFetch('/api/universities')
      .then((r) => r.json())
      .then(setUniversities)
      .catch(() => setUniversities([]));
  }, []);

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
                <select>
                  <option>All Universities</option>
                </select>
                <i className="fa-solid fa-chevron-down cn-select-arrow"></i>
              </div>
              <div className="cn-input-box">
                <input type="text" placeholder="Try searching for Kansas Tees..." />
                <i className="fa-solid fa-magnifying-glass cn-search-glass"></i>
              </div>
            </div>

            {/* Account & Bag actions */}
            <div className="cn-user-bar">
              <Link to="/signin" className="cn-account-link">
                <i className="fa-regular fa-user cn-user-icon"></i>
                <span>Sign in</span>
              </Link>
              <div className="cn-bag-wrapper">
                <i className="fa-solid fa-bag-shopping cn-bag-icon"></i>
              </div>
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
        <div className="cn-uni-tray">
          <div className="cn-container">
            <div className="cn-uni-scroll">
              {universities.map((uni) => (
                <div className="cn-uni-node" key={uni.slug || uni.name}>
                  <div className="cn-node-circle" style={{ backgroundColor: uni.primary_color }}>
                    <span style={{ color: uni.logo_color }}>{uni.logo}</span>
                  </div>
                  <span className="cn-node-name">{uni.name}</span>
                </div>
              ))}
            </div>
            <div className="cn-view-all-box">
              <a href="#all" className="cn-view-all-anchor">View All</a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;