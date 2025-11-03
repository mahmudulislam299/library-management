import React from "react";
import "./Allbooks.css";

function Allbooks() {
  return (
    <section className="books-page">
      <div className="books">
        {/* Book 1 */}
        <div className="book-card">
          <img
            src="book1.jpg"
            alt="Wings of Fire"
            loading="lazy"
          />
          <h3 className="book-title">Wings of Fire</h3>
          <p className="book-author">By Pranavdhar</p>
          <div className="book-category">
            <span>Autobiography</span>
          </div>
        </div>

        {/* Book 2 */}
        <div className="book-card">
          <img
            src="book2.webp"
            alt="The Power of Your Subconscious Mind"
            loading="lazy"
          />
          <h3 className="book-title">The Power of Your Subconscious Mind</h3>
          <p className="book-author">By Joseph</p>
          <div className="book-category">
            <span>Psychology</span>
          </div>
        </div>

        {/* Book 3 */}
        <div className="book-card">
          <img
            src="book3.jpg"
            alt="Elon Musk"
            loading="lazy"
          />
          <h3 className="book-title">Elon Musk</h3>
          <p className="book-author">By Elon</p>
          <div className="book-category">
            <span>Autobiography</span>
          </div>
        </div>

        {/* Book 4 */}
        <div className="book-card">
          <img
            src="book4.jpg"
            alt="The Subtle Art"
            loading="lazy"
          />
          <h3 className="book-title">The Subtle Art of Not Giving a F*ck</h3>
          <p className="book-author">By Mark Manson</p>
          <div className="book-category">
            <span>Self‑Help</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Allbooks;