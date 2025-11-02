import React from "react";
import "./Allbooks.css";

function Allbooks() {
  return (
    <section className="books-page">
      <div className="books">
        {/* Book 1 */}
        <div className="book-card">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp16xiXu1ZtTzbLy-eSwEK4Ng6cUpUZnuGbQ&usqp=CAU"
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
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-Rb2t6jA5ml7n57qdTZbAOWX1qSfsLCbaOA&usqp=CAU"
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
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRFiDRQ7a-Oo-CnMmnbIMApP1Cq9B5bYx-UA&usqp=CAU"
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
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-Rb2t6jA5ml7n57qdTZbAOWX1qSfsLCbaOA&usqp=CAU"
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