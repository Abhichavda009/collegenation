import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";
import "./UniversitiesPage.css";

const CONFERENCES = [
  {
    name: "ACC",
    mark: "ACC",
    className: "up-conf-acc",
    schools: ["Clemson", "Syracuse", "Virginia"],
  },
  {
    name: "Big Ten",
    mark: "B1G",
    className: "up-conf-big-ten",
    schools: ["Maryland", "Michigan", "UCLA", "Washington"],
  },
  {
    name: "Big 12",
    mark: "XII",
    className: "up-conf-big-12",
    schools: ["Arizona", "Kansas", "TCU"],
  },
  {
    name: "Big East",
    mark: "BIG EAST",
    className: "up-conf-big-east",
    schools: ["Villanova"],
  },
  {
    name: "SEC",
    mark: "SEC",
    className: "up-conf-sec",
    schools: ["Alabama", "LSU", "Missouri", "Tennessee"],
  },
];

const DISPLAY_NAMES = {
  Virginia: "UVA",
};

const productsPath = (name) =>
  `/collections/all-products?university=${encodeURIComponent(name)}`;

const UniversitiesPage = () => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    apiFetch("/api/universities")
      .then((r) => r.json())
      .then(setUniversities)
      .catch(() => setUniversities([]));
  }, []);

  const byName = useMemo(() => {
    return universities.reduce((acc, university) => {
      acc[university.name] = university;
      return acc;
    }, {});
  }, [universities]);

  return (
    <>
      <Header showUniversityTray={false} />

      <main className="up">
        <div className="up-inner">
          <h1 className="up-title">Universities</h1>

          <div className="up-list">
            {CONFERENCES.map((conference) => {
              const schools = conference.schools
                .map((name) => byName[name])
                .filter(Boolean);

              if (!schools.length) return null;

              return (
                <section className="up-conference" key={conference.name}>
                  <div className="up-conference-heading">
                    <span className={`up-conference-mark ${conference.className}`}>
                      {conference.mark}
                    </span>
                    <h2>{conference.name}</h2>
                  </div>

                  <div className="up-schools">
                    {schools.map((school) => (
                      <Link
                        to={productsPath(school.name)}
                        className="up-school"
                        key={school.slug || school.name}
                      >
                        <span
                          className="up-school-logo"
                          style={{ backgroundColor: school.primary_color }}
                        >
                          <span style={{ color: school.logo_color }}>
                            {school.logo}
                          </span>
                        </span>
                        <span className="up-school-name">
                          {DISPLAY_NAMES[school.name] || school.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default UniversitiesPage;
