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
        const shelf = (b.shelfNumber || "").toLowerCase();

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

  const handleEdit = async (book) => {
    if (!user?.isAdmin) {
      alert("You do not have permission to edit books.");
      return;
    }

    const currentShelf = book.shelfNumber || "";
    const newShelf = window.prompt(
      `Enter new shelf number for "${book.bookName}"`,
      currentShelf
    );

    if (newShelf === null) {
      return;
    }

    try {
      await axios.put(`${API_URL}/api/books/updatebook/${book._id}`, {
        isAdmin: user.isAdmin,
        shelfNumber: newShelf,
      });

      setBooks((prev) =>
        prev.map((b) =>
          b._id === book._id ? { ...b, shelfNumber: newShelf } : b
        )
      );
      setFiltered((prev) =>
        prev.map((b) =>
          b._id === book._id ? { ...b, shelfNumber: newShelf } : b
        )
      );

      alert("Book updated successfully ✅");
    } catch (err) {
      console.error("Error updating book", err);
      alert("Failed to update book");
    }
  };

  const handleDelete = async (book) => {
    if (!user?.isAdmin) {
      alert("You do not have permission to delete books.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${book.bookName}"?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/books/removebook/${book._id}`, {
        data: { isAdmin: user.isAdmin },
      });

      setBooks((prev) => prev.filter((b) => b._id !== book._id));
      setFiltered((prev) => prev.filter((b) => b._id !== book._id));

      alert("Book deleted successfully 🗑️");
    } catch (err) {
      console.error("Error deleting book", err);
      alert("Failed to delete book");
    }
  };

  return (
    <div className="booklibrary-container">
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
                    <Button
                      color="blue"
                      size="small"
                      onClick={() => handleEdit(book)}
                    >
                      <Icon name="edit" /> Edit
                    </Button>
                    <Button
                      color="red"
                      size="small"
                      onClick={() => handleDelete(book)}
                    >
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
