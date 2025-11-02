import React from "react";
import "./News.css";

function News() {
  return (
    <section className="news-section">
      <h2 className="news-title">Library Updates</h2>

      <div className="news-grid">
        {/* Competitions */}
        <div className="news-column">
          <h3 className="news-subtitle">Competitions</h3>
          <div className="news-list">
            <div className="news-item">
              <h4>Essay Writing Contest</h4>
              <p>Theme: "The Future of Digital Libraries" — Win a Kindle!</p>
            </div>
            <div className="news-item">
              <h4>Book Cover Design Challenge</h4>
              <p>Redesign a classic — Top 3 get published in the library gallery.</p>
            </div>
            <div className="news-item">
              <h4>Speed Reading Championship</h4>
              <p>Compete live on Nov 15 — Fastest reader wins a study lamp.</p>
            </div>
          </div>
        </div>

        {/* Online Quiz */}
        <div className="news-column">
          <h3 className="news-subtitle">Online Quiz</h3>
          <div className="news-list">
            <div className="news-item">
              <h4>General Knowledge Quiz</h4>
              <p>Every Friday at 6 PM — 10 questions, top scorer gets a gift card.</p>
            </div>
            <div className="news-item">
              <h4>Tech & AI Quiz</h4>
              <p>Test your knowledge on AI in libraries — Live on Nov 10.</p>
            </div>
            <div className="news-item">
              <h4>Literature Trivia</h4>
              <p>From Shakespeare to Tagore — Join this Sunday!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default News;