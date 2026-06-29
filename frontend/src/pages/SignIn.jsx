import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assetUrl } from "../lib/api";
import "./SignIn.css";

const DEFAULT_OTP = "123456";
const ADMIN_EMAIL = "admin123@gmail.com";
const ORDERS_KEY = "cn_orders";
const ORDER_COMPLETE_MS = 5 * 60 * 1000;
const emptyOtp = () => Array(DEFAULT_OTP.length).fill("");

const readOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
};

const money = (n) =>
  `$${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const withCurrentTracking = (order, now) => {
  if (!order) return null;

  const complete = now - new Date(order.placedAt).getTime() >= ORDER_COMPLETE_MS;
  return {
    ...order,
    tracking: {
      ...order.tracking,
      status: complete ? "Complete" : order.tracking.status,
      eta: complete ? "Delivered" : order.tracking.eta,
      currentStep: complete
        ? order.tracking.steps.length - 1
        : order.tracking.currentStep,
    },
  };
};

const SignIn = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(() =>
    localStorage.getItem("cn_logged_in") === "true" ? "account" : "email"
  );
  const [email, setEmail] = useState(
    () => localStorage.getItem("cn_account_email") || ""
  );
  const [accountView, setAccountView] = useState("orders");
  const [orders] = useState(readOrders);
  const [now, setNow] = useState(Date.now());
  const [detailsOpen, setDetailsOpen] = useState(true);
  const trackingOpen = false;
  const setTrackingOpen = () => {};
  const [otp, setOtp] = useState(emptyOtp);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef([]);

  const emailReady = email.trim().length > 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const submitEmail = (event) => {
    event.preventDefault();
    if (!emailReady) return;
    setStep("otp");
    setOtp(emptyOtp());
    setOtpError("");
    window.setTimeout(() => otpRefs.current[0]?.focus(), 0);
  };

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError("");

    if (digit && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    const code = next.join("");
    if (code.length === DEFAULT_OTP.length) {
      if (code === DEFAULT_OTP) {
        if (email.trim().toLowerCase() === ADMIN_EMAIL) {
          localStorage.setItem("cn_admin_logged_in", "true");
          localStorage.setItem("cn_admin_email", ADMIN_EMAIL);
          navigate("/admin");
          return;
        }
        localStorage.setItem("cn_logged_in", "true");
        localStorage.setItem("cn_account_email", email);
        setStep("account");
      } else {
        setOtpError(`Enter OTP ${DEFAULT_OTP}`);
      }
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const signOut = () => {
    localStorage.removeItem("cn_logged_in");
    localStorage.removeItem("cn_account_email");
    setAccountView("orders");
    setStep("email");
    setOtp(emptyOtp());
    setOtpError("");
  };

  if (step === "account") {
    const accountEmail = email || localStorage.getItem("cn_account_email") || "";
    const latestOrder = withCurrentTracking(orders[0], now);

    return (
      <div className="account-page">
        <header className="account-header">
          <Link to="/" className="signin-logo">
            COLLEGE NATION
          </Link>
          <button
            type="button"
            className="account-avatar"
            aria-label="Open profile"
            onClick={() => setAccountView("profile")}
          ></button>
        </header>

        <main className="account-main">
          <nav className="account-side" aria-label="Account navigation">
            <button
              type="button"
              className={accountView === "orders" ? "is-active" : ""}
              onClick={() => setAccountView("orders")}
            >
              Orders
            </button>
            <button
              type="button"
              className={accountView === "profile" ? "is-active" : ""}
              onClick={() => setAccountView("profile")}
            >
              Profile
            </button>
          </nav>

          {accountView === "profile" ? (
            <section className="profile-panel">
              <div className="profile-section-head">
                <h1>Contact</h1>
                <button type="button">Edit</button>
              </div>

              <div className="profile-card profile-contact-card">
                <span>Email</span>
                <strong>{accountEmail}</strong>
              </div>

              <div className="profile-section-head">
                <h2>Addresses</h2>
                <button type="button">Add</button>
              </div>

              <div className="profile-card profile-address-card">
                <span className="profile-icon-box profile-pin-icon"></span>
                <span>No addresses added</span>
              </div>

              <div className="profile-section-head">
                <h2>Marketing preferences</h2>
              </div>

              <div className="profile-card profile-marketing-card">
                <span className="profile-mail-row">
                  <span className="profile-mail-icon"></span>
                  Email
                </span>
                <span className="profile-toggle" aria-label="Email enabled">
                  <span></span>
                </span>
              </div>

              <div className="profile-actions">
                <button type="button" className="profile-signout" onClick={signOut}>
                  Sign out
                </button>
                <button type="button" className="profile-all-devices" onClick={signOut}>
                  Sign out of all devices
                </button>
              </div>
            </section>
          ) : (
            <>
              {latestOrder ? (
                <section className="orders-panel">
                  <div className="order-success-card">
                    <div>
                      <span className="order-kicker">Thank you</span>
                      <h1>Order confirmed</h1>
                      <p>
                        Order {latestOrder.id} was placed successfully. A
                        confirmation was sent to {latestOrder.email}.
                      </p>
                    </div>
                    <Link to="/" className="account-shop">
                      Shop now
                    </Link>
                  </div>

                  <div className="order-card">
                    <div className="order-card-head">
                      <div>
                        <h2>Order details</h2>
                        <span>
                          {new Date(latestOrder.placedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="order-head-actions">
                        <strong>{money(latestOrder.total)}</strong>
                        <button
                          type="button"
                          className={`order-collapse ${detailsOpen ? "is-open" : ""}`}
                          aria-label={detailsOpen ? "Collapse order details" : "Expand order details"}
                          onClick={() => setDetailsOpen((open) => !open)}
                        >
                          ▾
                        </button>
                      </div>
                    </div>

                    {detailsOpen && (
                      <>
                        <div className="order-items">
                          {latestOrder.items.map((item) => (
                            <div className="order-item" key={item.key}>
                              <img src={assetUrl(item.image_url)} alt={item.name} />
                              <div>
                                <strong>{item.name}</strong>
                                <span>
                                  {item.color} / {item.sizeLabel} x {item.quantity}
                                </span>
                              </div>
                              <span>{money(Number(item.price) * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="order-tracking-inline">
                          <div className="order-tracking-head">
                            <div>
                              <h3>Order tracking</h3>
                              <span>Tracking #{latestOrder.tracking.number}</span>
                            </div>
                            <strong>{latestOrder.tracking.status}</strong>
                          </div>
                          <p className="order-eta">{latestOrder.tracking.eta}</p>
                          <div className="tracking-steps">
                            {latestOrder.tracking.steps.map((label, index) => (
                              <div
                                className={`tracking-step${
                                  index <= latestOrder.tracking.currentStep
                                    ? " is-done"
                                    : ""
                                }`}
                                key={label}
                              >
                                <span></span>
                                <p>{label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="order-card order-tracking-card">
                    <div className="order-card-head">
                      <div>
                        <h2>Order tracking</h2>
                        <span>Tracking #{latestOrder.tracking.number}</span>
                      </div>
                      <div className="order-head-actions">
                        <strong>{latestOrder.tracking.status}</strong>
                        <button
                          type="button"
                          className={`order-collapse ${trackingOpen ? "is-open" : ""}`}
                          aria-label={trackingOpen ? "Collapse order tracking" : "Expand order tracking"}
                          onClick={() => setTrackingOpen((open) => !open)}
                        >
                          ▾
                        </button>
                      </div>
                    </div>
                    {trackingOpen && (
                      <>
                        <p className="order-eta">{latestOrder.tracking.eta}</p>
                        <div className="tracking-steps">
                          {latestOrder.tracking.steps.map((label, index) => (
                            <div
                              className={`tracking-step${
                                index <= latestOrder.tracking.currentStep ? " is-done" : ""
                              }`}
                              key={label}
                            >
                              <span></span>
                              <p>{label}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </section>
              ) : (
                <section className="account-welcome">
                  <div>
                    <h1>Welcome</h1>
                    <p>Ready to shop?</p>
                  </div>
                  <Link to="/" className="account-shop">
                    Shop now
                  </Link>
                </section>
              )}
            </>
          )}
        </main>

        <footer className="account-footer">
          <a href="#">Refund policy</a>
          <a href="#">Privacy policy</a>
          <a href="#">Terms of service</a>
        </footer>
      </div>
    );
  }

  return (
    <div className="signin">
      <Link to="/" className="signin-logo">
        COLLEGE NATION
      </Link>

      <div className="signin-main">
        {step === "email" ? (
          <div className="signin-card">
            <h1 className="signin-title">Sign in</h1>
            <p className="signin-sub">
              <span className="signin-sub-accent">Sign in</span> or create an
              account
            </p>

            <button type="button" className="signin-shop">
              Continue with shop
            </button>

            <div className="signin-or">or</div>

            <form className="signin-email" onSubmit={submitEmail}>
              <input
                type="email"
                placeholder="Email"
                aria-label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                type="submit"
                className={`signin-arrow ${emailReady ? "is-ready" : ""}`}
                aria-label="Continue"
                disabled={!emailReady}
              >
                &#8594;
              </button>
            </form>

            <label className="signin-check">
              <input type="checkbox" defaultChecked />
              <span>Email me with news and offers</span>
            </label>

            <p className="signin-terms">
              By continuing, you agree to our <a href="#">Terms of service</a>
            </p>
          </div>
        ) : (
          <div className="signin-card signin-code-card">
            <h1 className="signin-title">Enter code</h1>
            <p className="signin-sub">
              Sent to {email}{" "}
              <button
                type="button"
                className="signin-change"
                onClick={() => setStep("email")}
              >
                Change
              </button>
            </p>

            <div className="signin-otp" aria-label="One-time password">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpRefs.current[index] = node;
                  }}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`OTP digit ${index + 1}`}
                  onChange={(event) => updateOtp(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                />
              ))}
            </div>
            {otpError ? <p className="signin-otp-error">{otpError}</p> : null}
          </div>
        )}
      </div>

      <a href="#" className="signin-privacy">
        Privacy policy
      </a>
    </div>
  );
};

export default SignIn;
