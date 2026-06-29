import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CartPage.css";

const CART_KEY = "cn_cart";
const FREE_SHIPPING_TARGET = 45;

const money = (n, suffix = "") =>
  `$${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}${suffix}`;

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

const CartPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const saveCart = (next) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("cn_cart_updated"));
  };

  const updateQty = (key, delta) => {
    saveCart(
      items.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (key) => {
    saveCart(items.filter((item) => item.key !== key));
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const freeShippingLeft = Math.max(0, FREE_SHIPPING_TARGET - cartTotal);
  const shippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_TARGET) * 100);

  return (
    <>
      <Header showUniversityTray={false} />

      <main className="cart-page">
        <div className="cart-inner">
          <nav className="cart-crumbs">
            <Link to="/">Home</Link>
            <span>|</span>
            <span>Your cart</span>
          </nav>

          {items.length === 0 ? (
            <section className="cart-empty-page">
              <h1>Your cart is empty</h1>
              <p>Add your favorite campus gear and come back here to checkout.</p>
              <Link to="/collections/all-products">Shop now</Link>
            </section>
          ) : (
            <>
              <h1 className="cart-title">Your cart ({cartCount})</h1>

              <div className="cart-layout">
                <section className="cart-items-list">
                  {items.map((item) => (
                    <article className="cart-row" key={item.key}>
                      <button
                        type="button"
                        className="cart-remove"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.key)}
                      >
                        &times;
                      </button>
                      <Link to={`/products/${item.slug}`} className="cart-image-link">
                        <img src={item.image_url} alt={item.name} />
                      </Link>
                      <div className="cart-product-copy">
                        <Link to={`/products/${item.slug}`}>{item.name}</Link>
                        <span>
                          {item.color}, {item.sizeLabel}
                        </span>
                        <strong>{money(item.price)}</strong>
                      </div>
                      <div className="cart-row-qty">
                        <button type="button" onClick={() => updateQty(item.key, -1)}>
                          &minus;
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQty(item.key, 1)}>
                          +
                        </button>
                      </div>
                      <strong className="cart-row-total">
                        {money(Number(item.price) * item.quantity)}
                      </strong>
                    </article>
                  ))}
                </section>

                <aside className="cart-summary">
                  <div className="cart-free">
                    <span>
                      {freeShippingLeft > 0
                        ? `Spend ${money(freeShippingLeft)} more to reach free shipping!`
                        : "You have free shipping!"}
                    </span>
                    <div>
                      <span style={{ width: `${shippingProgress}%` }}></span>
                    </div>
                  </div>

                  <button type="button" className="cart-summary-toggle">
                    Order note <span>⌄</span>
                  </button>
                  <button type="button" className="cart-summary-toggle">
                    Estimate Shipping <span>⌄</span>
                  </button>

                  <div className="cart-estimated">
                    <span>Estimated total</span>
                    <strong>{money(cartTotal, " USD")}</strong>
                  </div>
                  <p className="cart-tax">Taxes and shipping calculated at checkout</p>

                  <a href="#shipping" className="cart-shipping-link">
                    Learn more about Shipping Policies
                  </a>

                  <Link to="/checkout" className="cart-checkout">
                    Check Out
                  </Link>

                  <div className="cart-wallets">
                    <button type="button" className="cart-shop-pay">
                      shop
                    </button>
                    <button type="button" className="cart-paypal">
                      PayPal
                    </button>
                    <button type="button" className="cart-gpay">
                      <span>G</span> Pay
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CartPage;
