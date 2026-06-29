import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

const CART_KEY = "cn_cart";
const ORDERS_KEY = "cn_orders";

const money = (n) =>
  `$${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const accountEmail = localStorage.getItem("cn_account_email") || "";

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const handlePayNow = () => {
    if (!items.length) {
      navigate("/cart");
      return;
    }

    const order = {
      id: `CN-${Date.now().toString().slice(-6)}`,
      placedAt: new Date().toISOString(),
      email: accountEmail || "abhishekchavda502@gmail.com",
      items,
      total: subtotal,
      tracking: {
        number: `CNTRK${Date.now().toString().slice(-7)}`,
        status: "Order confirmed",
        eta: "Arrives in 5-7 business days",
        steps: ["Order placed", "Processing", "Packed", "Shipped", "Delivered"],
        currentStep: 1,
      },
    };

    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch {
      existing = [];
    }

    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existing]));
    localStorage.removeItem(CART_KEY);
    localStorage.setItem("cn_logged_in", "true");
    localStorage.setItem("cn_account_email", order.email);
    window.dispatchEvent(new Event("cn_cart_updated"));
    navigate("/signin");
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <Link to="/" className="checkout-logo">
          COLLEGE NATION
        </Link>
        <Link to="/cart" className="checkout-bag" aria-label="Cart">
          <span>{cartCount}</span>
        </Link>
      </header>

      <main className="checkout-shell">
        <section className="checkout-form">
          <div className="checkout-express">
            <p>Express checkout</p>
            <div className="checkout-wallets">
              <button type="button" className="checkout-shop">shop</button>
              <button type="button" className="checkout-paypal">PayPal</button>
              <button type="button" className="checkout-gpay"><span>G</span> Pay</button>
            </div>
          </div>

          <div className="checkout-or"><span>OR</span></div>

          <div className="checkout-account-row">
            <span className="checkout-avatar">
              {(accountEmail || "A").slice(0, 1).toUpperCase()}
            </span>
            <span>{accountEmail || "abhishekchavda502@gmail.com"}</span>
            <button type="button" aria-label="Account menu">⋮</button>
          </div>

          <form className="checkout-address">
            <label className="checkout-field checkout-full">
              <span>Country/Region</span>
              <select defaultValue="United States">
                <option>United States</option>
                <option>India</option>
                <option>Canada</option>
              </select>
            </label>

            <input placeholder="First name" />
            <input placeholder="Last name" />

            <label className="checkout-field checkout-full checkout-search-field">
              <input placeholder="Address" />
              <span>⌕</span>
            </label>

            <input className="checkout-full" placeholder="Apartment, suite, etc. (optional)" />

            <input placeholder="City" />
            <select defaultValue="">
              <option value="" disabled>State</option>
              <option>Alabama</option>
              <option>California</option>
              <option>Florida</option>
              <option>New York</option>
              <option>Texas</option>
            </select>
            <input placeholder="ZIP code" />

            <label className="checkout-field checkout-full checkout-phone-field">
              <input placeholder="Phone" />
              <span>?</span>
            </label>
          </form>

          <label className="checkout-check">
            <input type="checkbox" />
            <span>Text me with news and offers</span>
          </label>

          <section className="checkout-section">
            <h2>Shipping method</h2>
            <div className="checkout-muted-box">
              Enter your shipping address to view available shipping methods.
            </div>
          </section>

          <section className="checkout-section">
            <h2>Payment</h2>
            <p>All transactions are secure and encrypted.</p>

            <div className="checkout-payment-box">
              <div className="checkout-card-head">
                <span className="checkout-radio is-active"></span>
                <strong>Credit card</strong>
                <div className="checkout-cards">
                  <span>VISA</span>
                  <span>●●</span>
                  <span>AM EX</span>
                  <span>+5</span>
                </div>
              </div>

              <div className="checkout-card-body">
                <label className="checkout-field checkout-full checkout-lock-field">
                  <input placeholder="Card number" />
                  <span>▢</span>
                </label>
                <input placeholder="Expiration date (MM / YY)" />
                <label className="checkout-field checkout-help-field">
                  <input placeholder="Security code" />
                  <span>?</span>
                </label>
                <input className="checkout-full" placeholder="Name on card" />
                <label className="checkout-billing">
                  <input type="checkbox" defaultChecked />
                  <span>Use shipping address as billing address</span>
                </label>
              </div>

              <div className="checkout-paypal-row">
                <span className="checkout-radio"></span>
                <strong>PayPal</strong>
                <em>PayPal</em>
              </div>
            </div>
          </section>

          <div className="checkout-save">
            <div>
              <strong>Save my information for a faster checkout</strong>
              <p>
                By paying, you agree to create a Shop account subject to Shop's{" "}
                <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
              </p>
            </div>
            <button type="button">Not now</button>
          </div>

          <button type="button" className="checkout-pay-now" onClick={handlePayNow}>
            Pay now
          </button>

          <footer className="checkout-footer-links">
            <a href="#refund">Refund policy</a>
            <a href="#privacy">Privacy policy</a>
            <a href="#terms">Terms of service</a>
          </footer>
        </section>

        <aside className="checkout-summary">
          {items.length === 0 ? (
            <div className="checkout-empty">
              <p>Your cart is empty.</p>
              <Link to="/collections/all-products">Shop now</Link>
            </div>
          ) : (
            <>
              <div className="checkout-summary-items">
                {items.map((item) => (
                  <div className="checkout-summary-item" key={item.key}>
                    <div className="checkout-thumb-wrap">
                      <img src={item.image_url} alt={item.name} />
                      <span>{item.quantity}</span>
                    </div>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.color} / {item.sizeLabel}</p>
                    </div>
                    <span>{money(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-discount">
                <input placeholder="Discount code" />
                <button type="button">Apply</button>
              </div>

              <div className="checkout-price-lines">
                <div>
                  <span>Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>Enter shipping address</span>
                </div>
              </div>

              <div className="checkout-total">
                <span>Total</span>
                <strong><small>USD</small> {money(subtotal)}</strong>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
};

export default CheckoutPage;
