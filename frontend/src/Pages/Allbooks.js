import React from "react";
import "./Allbooks.css";

function Allbooks() {
  // Array of book objects — easy to modify!
const books = [
  {
    id: 1,
    image: "book1.jpg",
    alt: "title 1",
    title: "title 1",
    author: "author 1",
    category: "Autobiography",
  },
  {
    id: 2,
    image: "book2.webp",
    alt: "title 2",
    title: "title 2",
    author: "author 2",
    category: "Psychology",
  },
  {
    id: 3,
    image: "book3.jpg",
    alt: "title 3",
    title: "title 3",
    author: "author 3",
    category: "Autobiography",
  },
  {
    id: 4,
    image: "book4.jpg",
    alt: "title 4",
    title: "title 4",
    author: "author 4",
    category: "Computer Science",
  },
  {
    id: 5,
    image: "book5.jpg",
    alt: "title 5",
    title: "title 5",
    author: "author 5",
    category: "Fiction",
  },
  {
    id: 6,
    image: "book6.jpg",
    alt: "title 6",
    title: "title 6",
    author: "author 6",
    category: "Science",
  },
  {
    id: 7,
    image: "book7.jpg",
    alt: "title 7",
    title: "title 7",
    author: "author 7",
    category: "History",
  },
  {
    id: 8,
    image: "book8.jpg",
    alt: "title 8",
    title: "title 8",
    author: "author 8",
    category: "Philosophy",
  },
  {
    id: 9,
    image: "book9.webp",
    alt: "title 9",
    title: "title 9",
    author: "author 9",
    category: "Business",
  },
  {
    id: 10,
    image: "book10.jpg",
    alt: "title 10",
    title: "title 10",
    author: "author 10",
    category: "Self-Help",
  },
  {
    id: 11,
    image: "book11.jpg",
    alt: "title 11",
    title: "title 11",
    author: "author 11",
    category: "Technology",
  },
  {
    id: 12,
    image: "book12.jpg",
    alt: "title 12",
    title: "title 12",
    author: "author 12",
    category: "Art",
  },
  {
    id: 13,
    image: "book13.jpg",
    alt: "title 13",
    title: "title 13",
    author: "author 13",
    category: "Travel",
  },
  {
    id: 14,
    image: "book14.webp",
    alt: "title 14",
    title: "title 14",
    author: "author 14",
    category: "Cooking",
  },
  {
    id: 15,
    image: "book15.jpeg",
    alt: "title 15",
    title: "title 15",
    author: "author 15",
    category: "Mystery",
  },
];

  return (
    <section className="books-page">
      <div className="books">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <img
              src={book.image}
              alt={book.alt}
              loading="lazy"
            />
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">{book.author}</p>
            <div className="book-category">
              <span>{book.category}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Allbooks;