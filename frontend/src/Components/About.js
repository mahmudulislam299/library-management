import React from "react";
import "./About.css";

function About() {
  return (
    <section className="about-section">
      <h2 className="about-title">About the Library</h2>

      <div className="about-card">
        <div className="about-grid">
          {/* Image */}
          <div className="about-image">
            <img
              src="lib.png"
              alt="Stamford University Library"
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div className="about-text-content">
            <p className="about-paragraph">
              The <strong>Stamford University Bangladesh Library</strong> serves as the
              intellectual heart of the university — a dynamic hub for learning,
              research, and innovation.
            </p>

            <p className="about-paragraph">
              With a modern catalog system, comfortable study spaces, and a dedicated
              support team, we empower students and faculty with access to over
              50,000 books, journals, e-resources, and online databases.
            </p>

            <p className="about-paragraph">
              We value your feedback to continuously improve and make the library
              experience even better for everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;