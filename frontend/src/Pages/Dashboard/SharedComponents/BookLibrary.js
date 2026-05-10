import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Button, Dropdown, Icon } from "semantic-ui-react";
import { AuthContext } from "../../../Context/AuthContext";
import "./BookLibrary.css";

function BookLibrary() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({
    bookName: "",
    alternateTitle: "",
    author: "",
    language: "",
    publisher: "",
    shelfNumber: "",
    bookCountAvailable: "",
    bookStatus: "Available",
    categories: [],
  });
  const [isSaving, setIsSaving] = useState(false);

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
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories/allcategories`);
        setAllCategories(
          res.data.map((category) => ({
            value: category._id,
            text: category.categoryName,
          }))
        );
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };

    if (user?.isAdmin) {
      fetchCategories();
    }
  }, [API_URL, user?.isAdmin]);

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

  const getCategoryIds = (book) =>
    (book.categories || []).map((category) =>
      typeof category === "string" ? category : category._id
    );

  const getCategoryText = (book) => {
    const categories = book.categories || book.category || [];

    if (!categories.length) {
      return "Uncategorized";
    }

    return categories
      .map((category) =>
        typeof category === "string"
          ? allCategories.find((option) => option.value === category)?.text ||
            category
          : category.categoryName || category.text || category._id
      )
      .join(", ");
  };

  const openEditModal = (book) => {
    if (!user?.isAdmin) {
      alert("You do not have permission to edit books.");
      return;
    }

    setEditingBook(book);
    setEditForm({
      bookName: book.bookName || "",
      alternateTitle: book.alternateTitle || "",
      author: book.author || "",
      language: book.language || "",
      publisher: book.publisher || "",
      shelfNumber: book.shelfNumber || "",
      bookCountAvailable:
        book.bookCountAvailable === undefined ? "" : book.bookCountAvailable,
      bookStatus: book.bookStatus || "Available",
      categories: getCategoryIds(book),
    });
  };

  const closeEditModal = () => {
    setEditingBook(null);
    setIsSaving(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editingBook) return;

    if (
      !editForm.bookName ||
      !editForm.author ||
      editForm.bookCountAvailable === ""
    ) {
      alert("Book Name, Author and Copies are required.");
      return;
    }

    setIsSaving(true);

    const updatedBookData = {
      ...editForm,
      bookCountAvailable: Number(editForm.bookCountAvailable),
      isAdmin: user?.isAdmin,
    };

    try {
      const res = await axios.put(
        `${API_URL}/api/books/updatebook/${editingBook._id}`,
        updatedBookData
      );
      const updatedBook =
        typeof res.data === "object"
          ? res.data
          : { ...editingBook, ...updatedBookData };

      setBooks((prev) =>
        prev.map((b) => (b._id === editingBook._id ? updatedBook : b))
      );
      setFiltered((prev) =>
        prev.map((b) => (b._id === editingBook._id ? updatedBook : b))
      );

      closeEditModal();
      alert("Book updated successfully");
    } catch (err) {
      console.error("Error updating book", err);
      alert("Failed to update book");
      setIsSaving(false);
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
        params: { isAdmin: user.isAdmin },
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
          filtered.map((book) => (
            <div key={book._id} className="book-card-static">
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
                  {getCategoryText(book)}
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
                      onClick={() => openEditModal(book)}
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

      {editingBook && (
        <div className="edit-book-overlay" role="dialog" aria-modal="true">
          <div className="edit-book-modal">
            <div className="edit-book-header">
              <h3>Edit Book</h3>
              <Button icon size="mini" type="button" onClick={closeEditModal}>
                <Icon name="close" />
              </Button>
            </div>

            <form className="edit-book-form" onSubmit={handleEditSubmit}>
              <label>
                Book Name<span className="required-field">*</span>
                <input
                  type="text"
                  name="bookName"
                  value={editForm.bookName}
                  onChange={handleEditFormChange}
                  required
                />
              </label>

              <label>
                Alternate Title
                <input
                  type="text"
                  name="alternateTitle"
                  value={editForm.alternateTitle}
                  onChange={handleEditFormChange}
                />
              </label>

              <label>
                Author<span className="required-field">*</span>
                <input
                  type="text"
                  name="author"
                  value={editForm.author}
                  onChange={handleEditFormChange}
                  required
                />
              </label>

              <label>
                Language
                <input
                  type="text"
                  name="language"
                  value={editForm.language}
                  onChange={handleEditFormChange}
                />
              </label>

              <label>
                Publisher
                <input
                  type="text"
                  name="publisher"
                  value={editForm.publisher}
                  onChange={handleEditFormChange}
                />
              </label>

              <label>
                Shelf Number
                <input
                  type="text"
                  name="shelfNumber"
                  value={editForm.shelfNumber}
                  onChange={handleEditFormChange}
                />
              </label>

              <label>
                Copies Available<span className="required-field">*</span>
                <input
                  type="number"
                  min="0"
                  name="bookCountAvailable"
                  value={editForm.bookCountAvailable}
                  onChange={handleEditFormChange}
                  required
                />
              </label>

              <label>
                Status
                <select
                  name="bookStatus"
                  value={editForm.bookStatus}
                  onChange={handleEditFormChange}
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </label>

              <div className="edit-book-categories">
                <span>Categories</span>
                <Dropdown
                  placeholder="Select Categories"
                  fluid
                  multiple
                  search
                  selection
                  options={allCategories}
                  value={editForm.categories}
                  onChange={(event, { value }) =>
                    setEditForm((prev) => ({ ...prev, categories: value }))
                  }
                />
              </div>

              <div className="edit-book-actions">
                <Button type="button" onClick={closeEditModal}>
                  Cancel
                </Button>
                <Button color="blue" type="submit" loading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookLibrary;
