import React, { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import "./Footer.css";

const legalLinks = [
  "Terms of Use",
  "Privacy Policy",
  "Do Not Sell My Info - CA Only",
  "Cookie Preference Policy",
  "CCPA Notice",
  "Additional Privacy Disclosures for Certain States and Canada",
];

const supportLinks = ["About Us", "FAQ", "Shipping Policy", "Returns Policy"];

const FooterCol = ({ title, links }) => (
  <div className="ft-col">
    <h4 className="ft-col-title">{title}</h4>
    <ul className="ft-list">
      {links.map((l) => (
        <li key={l}>
          <a href="#">{l}</a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const [collectionLinks, setCollectionLinks] = useState([]);
  const [universityLinks, setUniversityLinks] = useState([]);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((r) => r.json())
      .then((rows) => setCollectionLinks(rows.map((c) => c.name)))
      .catch(() => {});
    apiFetch("/api/universities")
      .then((r) => r.json())
      .then((rows) => setUniversityLinks(rows.map((u) => u.name)))
      .catch(() => {});
  }, []);

  return (
  <footer className="ft">
    <div className="ft-inner">
      <div className="ft-top">
        {/* Newsletter */}
        <div className="ft-news">
          <h3 className="ft-news-title">JOIN THE COLLEGE CREW NEWSLETTER</h3>
          <p className="ft-news-sub">
            For new drops, sales &amp; stuff we don't post anywhere else.
          </p>

          <form className="ft-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              className="ft-input"
              placeholder="Enter your email"
              aria-label="Email address"
            />
            <button type="submit" className="ft-signup">
              Sign Up
            </button>
          </form>

          <p className="ft-fine">
            By subscribing you agree to the <a href="#">Terms of Use</a> and{" "}
            <a href="#">Privacy Policy</a> and{" "}
            <a href="#">Cookie Preference Policy</a>
          </p>
        </div>

        <FooterCol title="Shop By Collection" links={collectionLinks} />
        <FooterCol title="Shop By University" links={universityLinks} />
        <FooterCol title="Legal" links={legalLinks} />
        <FooterCol title="Customer Support" links={supportLinks} />
      </div>

      {/* Social icons */}
      <div className="ft-social-row">
        <a href="#" className="ft-soc" aria-label="Instagram">
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a href="#" className="ft-soc" aria-label="TikTok">
          <i className="fa-brands fa-tiktok"></i>
        </a>
      </div>

      {/* Bottom bar */}
      <div className="ft-bottom">
        <span className="ft-copy">
          © 2026 College Nation. Powered by P3 Media
        </span>
        <a href="#" className="ft-shop">
          <i className="fa-solid fa-heart"></i>
          Follow on shop
        </a>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
