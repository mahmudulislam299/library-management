import React from "react";
import "./RecentAddedBooks.css";

function RecentAddedBooks() {
  const books = [
    "book11.jpg",
    "book8.jpg",
    "book12.jpg",
    "book7.jpg",
    "book13.jpg",
    "book10.jpg",
    "book14.webp",
    "book11.jpg",
    "book15.jpeg",
    "book4.jpg",
    "book12.jpg",
    "book5.jpg",
    "book6.jpg",
    
  ];

  return (
    <section className="recentaddedbooks-container">
      <h2 className="recentbooks-title">Recent Uploads</h2>
      <div className="recentbooks">
        <div className="recentbook-track">
          {/* First set */}
          {books.map((src, i) => (
            <img
              key={i}
              className="recent-book"
              src={src}
              alt={`Recent book ${i + 1}`}
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {books.map((src, i) => (
            <img
              key={`dup-${i}`}
              className="recent-book"
              src={src}
              alt={`Recent book ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecentAddedBooks;