import React from "react";
import "./RecentAddedBooks.css";

function RecentAddedBooks() {
  const books = [
    "book11.jpg",
    "book12.jpg",
    "book13.jpg",
    "book14.webp",
    "book15.jpeg",
    "https://19en282jw7pc3zpwj22pg8v0-wpengine.netdna-ssl.com/wp-content/uploads/2021/01/Good-to-Great-Jim-Collins.jpg",
    "https://images-na.ssl-images-amazon.com/images/I/81mXQdi5x+L.jpg",
    "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1498813353l/34267304.jpg",
    "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/action-thriller-book-cover-design-template-3675ae3e3ac7ee095fc793ab61b812cc_screen.jpg?ts=1588152105",
    "https://inkinmytea.files.wordpress.com/2011/12/apj.jpg?w=640",
    "https://images-na.ssl-images-amazon.com/images/I/91VokXkn8hL.jpg",
    "https://images-na.ssl-images-amazon.com/images/I/81-QB7nDh4L.jpg",
    "https://images-na.ssl-images-amazon.com/images/I/71m-MxdJ2WL.jpg",
    "https://images-na.ssl-images-amazon.com/images/I/71t4GuxLCuL.jpg",
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