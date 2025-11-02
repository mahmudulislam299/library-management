import React from "react";
import "./PopularBooks.css";

function PopularBooks() {
  const books = [
    "book1.jpg",
    "book2.webp",
    "book3.jpg",
    "book4.jpg",
    "book5.jpg",
    "book6.jpg",
    "book7.jpg",
    "book8.jpg",
    "book9.webp",
    "book10.jpg",
    "book11.jpg",
    "book12.jpg",
  ];

  return (
    <section className="popularbooks-container">
      <h2 className="popularbooks-title">Popular Books</h2>
      <div className="popularbooks">
        <div className="popularbook-track">
          {/* First set */}
          {books.map((src, i) => (
            <img key={i} className="popular-book" src={src} alt={`Book ${i + 1}`} />
          ))}
          {/* Duplicate set for seamless loop */}
          {books.map((src, i) => (
            <img key={`dup-${i}`} className="popular-book" src={src} alt={`Book ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularBooks;