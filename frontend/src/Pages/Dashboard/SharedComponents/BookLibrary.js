import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Button, Icon } from "semantic-ui-react";
import { AuthContext } from "../../../Context/AuthContext";
import "./BookLibrary.css";

function BookLibrary() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/books/allbooks`);
        setBooks(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error fetching books", err);
      }
    };
    fetchBooks();
  }, [API_URL]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      books.filter((b) => {
        const name = (b.bookName || "").toLowerCase();
        const author = (b.author || "").toLowerCase();
        const language = (b.language || "").toLowerCase();
        const shelf = (b.shelfNumber || "").toLowerCase(); // 🔹 search by shelf too

        return (
          name.includes(lower) ||
          author.includes(lower) ||
          language.includes(lower) ||
          shelf.includes(lower)
        );
      })
    );
  }, [search, books]);

  const handleReserve = async (bookId) => {
    alert(`Reserved book ID: ${bookId} (feature in progress)`); 
  };

  return (
    <div className="booklibrary-container">
      {/* Header + Search */}
      <div className="library-header">
        <h2 className="library-title">📘 Library Collection</h2>
        <input
          type="text"
          placeholder="Search by book, author, language, or shelf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="library-search"
        />
      </div>

      {/* Cards */}
      <div className="book-grid">
        {filtered.length === 0 ? (
          <p className="no-books-text">No books found</p>
        ) : (
          filtered.map((book, i) => (
            <div key={i} className="book-card-static">
              <div className="book-card-header">
                <h3 className="book-title">{book.bookName}</h3>
                <p className="book-author">{book.author}</p>
              </div>

              <div className="book-details">
                <p>
                  <Icon name="language" /> <b>Language:</b>{" "}
                  {book.language || "N/A"}
                </p>
                <p>
                  <Icon name="building" /> <b>Publisher:</b>{" "}
                  {book.publisher || "N/A"}
                </p>
                <p>
                  <Icon name="grid layout" /> <b>Shelf:</b>{" "}
                  {book.shelfNumber || "Not set"}
                </p>
                <p>
                  <Icon name="tag" /> <b>Category:</b>{" "}
                  {book.category?.join(", ") || "Uncategorized"}
                </p>
                <p>
                  <Icon
                    name="check circle"
                    color={book.bookCountAvailable > 0 ? "green" : "red"}
                  />
                  <b> Available:</b> {book.bookCountAvailable}
                </p>
              </div>

              <div className="book-card-footer">
                {user?.isAdmin ? (
                  <div className="admin-actions">
                    <Button color="blue" size="small">
                      <Icon name="edit" /> Edit
                    </Button>
                    <Button color="red" size="small">
                      <Icon name="trash" /> Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    color={book.bookCountAvailable > 0 ? "green" : "grey"}
                    size="small"
                    disabled={book.bookCountAvailable <= 0}
                    onClick={() => handleReserve(book._id)}
                  >
                    <Icon name="bookmark" />
                    {book.bookCountAvailable > 0 ? "Reserve" : "Unavailable"}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookLibrary;
