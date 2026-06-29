import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import "./UniversityCollections.css";

const UniversityCollections = () => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    apiFetch("/api/universities")
      .then((r) => r.json())
      .then(setUniversities)
      .catch(() => setUniversities([]));
  }, []);

  return (
    <section className="uc">
      <div className="uc-inner">
        <h2 className="uc-heading">University Collections</h2>

        <div className="uc-grid">
          {universities.map((u) => (
            <Link
              className="uc-card"
              to={`/universities/${u.slug || u.name.toLowerCase()}`}
              key={u.slug || u.name}
              aria-label={`${u.name} collection`}
            >
              <div
                className="uc-square"
                style={{ backgroundColor: u.primary_color }}
              >
                <span
                  className="uc-logo"
                  style={{
                    color: u.logo_color,
                    fontSize: (u.logo || "").length > 1 ? "56px" : "88px",
                  }}
                >
                  {u.logo}
                </span>
              </div>
              <div className="uc-foot">
                <span className="uc-name">{u.name}</span>
                <span className="uc-arrow" aria-hidden="true">
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniversityCollections;
