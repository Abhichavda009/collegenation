import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ContactPage.css";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    e.target.reset();
  };

  return (
    <>
      <Header />

      <div className="ct">
        <div className="ct-inner">
          <nav className="ct-crumbs">
            <Link to="/">Home</Link>
            <span className="ct-sep">|</span>
            <span className="ct-crumb-active">Contact</span>
          </nav>

          <h1 className="ct-title">Contact Us</h1>
          <p className="ct-sub">
            Your satisfaction is important to us! Chat or text us your questions
            about products, online orders, experiences and more.
          </p>

          <div className="ct-body">
            <form className="ct-form" onSubmit={handleSubmit}>
              {submitted && (
                <div className="ct-success">
                  Thanks! Your message has been sent — we'll get back to you
                  soon.
                </div>
              )}

              <div className="ct-grid">
                <div className="ct-field">
                  <label htmlFor="ct-name">Name</label>
                  <input id="ct-name" name="name" type="text" placeholder="Name" />
                </div>
                <div className="ct-field">
                  <label htmlFor="ct-email">
                    Email <span className="ct-req">*</span>
                  </label>
                  <input
                    id="ct-email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="ct-field">
                  <label htmlFor="ct-phone">
                    Phone Number <span className="ct-req">*</span>
                  </label>
                  <input
                    id="ct-phone"
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    required
                  />
                </div>
                <div className="ct-field">
                  <label htmlFor="ct-order">Order Number</label>
                  <input
                    id="ct-order"
                    name="order"
                    type="text"
                    placeholder="Order Number"
                  />
                </div>
                <div className="ct-field ct-field-full">
                  <label htmlFor="ct-message">Your message</label>
                  <textarea
                    id="ct-message"
                    name="message"
                    rows="7"
                    placeholder="Your message"
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="ct-submit">
                Submit Now
              </button>
            </form>

            <aside className="ct-help">
              <h2 className="ct-help-title">Need Help?</h2>
              <p className="ct-help-text">
                Have any questions or concerns with your experience with College
                Nation? Contact us today.
              </p>

              <div className="ct-help-item">
                <span className="ct-help-icon">
                  <i className="fa-solid fa-phone"></i>
                </span>
                <div className="ct-help-detail">
                  <strong>Call Us</strong>
                  <a href="tel:8003815151">(800)-381-5151</a>
                </div>
              </div>

              <div className="ct-help-item">
                <span className="ct-help-icon">
                  <i className="fa-solid fa-comment-dots"></i>
                </span>
                <div className="ct-help-detail">
                  <strong>Email Us</strong>
                  <a href="mailto:customerservice@collegenation.com">
                    customerservice@collegenation.com
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
