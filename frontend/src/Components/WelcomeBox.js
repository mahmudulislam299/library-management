import React from "react";
import "./WelcomeBox.css";

function WelcomeBox() {
  return (
    <section className="welcome-section">
      <div className="welcome-box">
        <h1 className="welcome-title">
          Welcome to <span className="highlight">Stamford Library</span>
        </h1>
        <p className="welcome-message">
          Empower Your Mind
          <span className="welcome-submessage">Explore. Learn. Grow.</span>
        </p>
      </div>
    </section>
  );
}

export default WelcomeBox;