import React from "react";
import { Link } from "react-router-dom";
import "./SignIn.css";

const SignIn = () => {
  return (
    <div className="signin">
      <Link to="/" className="signin-logo">
        COLLEGE NATION
      </Link>

      <div className="signin-main">
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

          <form className="signin-email" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email" aria-label="Email" />
            <button type="submit" className="signin-arrow" aria-label="Continue">
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
      </div>

      <a href="#" className="signin-privacy">
        Privacy policy
      </a>
    </div>
  );
};

export default SignIn;
