import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./FaqPage.css";

const SECTIONS = [
  {
    title: "Ordering & Accounts",
    items: [
      {
        q: "Do I need an account to place an order?",
        a: "No — you're welcome to check out as a guest. Creating an account, however, lets you track orders, save your details, and check out faster next time.",
      },
      {
        q: "How do I create an account?",
        a: 'Click "Sign in" at the top of the page, choose "create an account," and enter your email. You\'ll be set up in just a few seconds.',
      },
      {
        q: "How do I place an order?",
        a: "Browse or search for your school's gear, pick your size and color, add the items to your bag, and proceed to checkout to complete your purchase.",
      },
      {
        q: "Can I modify or cancel my order after it's been placed?",
        a: "We process orders quickly, so please contact us as soon as possible. If your order hasn't shipped yet, we'll do our best to update or cancel it for you.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, Shop Pay, and popular digital wallets at checkout.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All transactions are encrypted and processed through secure, PCI-compliant payment providers. We never store your full card details.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How long does shipping take?",
        a: "Orders typically ship within 1–2 business days and arrive within 3–7 business days, depending on your location.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! Enjoy free standard shipping on all orders over $45.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely. Once your order ships, we'll email you a tracking number so you can follow it right to your door.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently we ship within the United States. We're working on expanding to more regions soon.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns of unworn, unwashed items with their original tags within 30 days of delivery.",
      },
      {
        q: "How do I start a return or exchange?",
        a: "Visit our Contact page or email customerservice@collegenation.com with your order number, and we'll guide you through the process.",
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are issued to your original payment method within 5–7 business days after we receive your return.",
      },
    ],
  },
  {
    title: "Products & Sizing",
    items: [
      {
        q: "Are your products officially licensed?",
        a: "Yes — all College Nation apparel and merchandise is officially licensed by the universities and brands we carry.",
      },
      {
        q: "How do I find the right size?",
        a: "Each product page includes a size guide. If you're between sizes, we generally recommend sizing up for a relaxed fit.",
      },
      {
        q: "Do you restock sold-out items?",
        a: "Many popular items are restocked. Sign up for our newsletter to be the first to know when favorites return.",
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-q"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <i className={`fa-solid fa-${open ? "minus" : "plus"}`}></i>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

const FaqPage = () => (
  <>
    <Header />

    <div className="faq">
      <div className="faq-inner">
        <nav className="faq-crumbs">
          <Link to="/">Home</Link>
          <span className="faq-sep">|</span>
          <span className="faq-crumb-active">FAQ</span>
        </nav>

        <div className="faq-content">
          <h1 className="faq-title">FAQ</h1>

          <p className="faq-lead-title">Your Ultimate College Gear Destination</p>
          <p className="faq-lead-text">
            Welcome to College Nation — we're your one-stop shop for officially
            licensed college apparel and merchandise, bringing the spirit of your
            favorite universities right to your doorstep. Below are some common
            questions to help you with your shopping experience.
          </p>

          {SECTIONS.map((section) => (
            <section className="faq-section" key={section.title}>
              <h2 className="faq-section-title">{section.title}</h2>
              {section.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>

    <Footer />
  </>
);

export default FaqPage;
