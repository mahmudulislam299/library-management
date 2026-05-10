import React, { useContext, useEffect, useState } from 'react';
import "../AdminDashboard.css";
import axios from "axios";
import { AuthContext } from '../../../../Context/AuthContext';
import { Dropdown } from 'semantic-ui-react';
import moment from "moment";

function AddBook() {

    const API_URL = process.env.REACT_APP_API_URL;
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const [bookName, setBookName] = useState("");
    const [alternateTitle, setAlternateTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [bookCountAvailable, setBookCountAvailable] = useState(null);
    const [language, setLanguage] = useState("");
    const [publisher, setPublisher] = useState("");
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [recentAddedBooks, setRecentAddedBooks] = useState([]);

    /* Fetch all the Categories */
    useEffect(() => {
        const getAllCategories = async () => {
            try {
                const response = await axios.get(API_URL + "/api/categories/allcategories");
                const all_categories = response.data.map(category => ({
                    value: category._id,
                    text: category.categoryName
                }));
                setAllCategories(all_categories);
            }
            catch (err) {
                console.log(err);
            }
        };
        getAllCategories();
    }, [API_URL]);

    /* Adding book function */
    const addBook = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!bookName || !author || !bookCountAvailable || selectedCategories.length === 0) {
            alert("Book Name, Author, Copies and at least one Category are required.");
            setIsLoading(false);
            return;
        }

        const BookData = {
            bookName: bookName,
            alternateTitle: alternateTitle,
            author: author,
            bookCountAvailable: bookCountAvailable,
            language: language,
            publisher: publisher,
            categories: selectedCategories,   // array of category IDs
            isAdmin: user?.isAdmin
        };

        try {
            const response = await axios.post(API_URL + "/api/books/addbook", BookData);
            setRecentAddedBooks((prev) => [response.data, ...prev].slice(0, 5));
            setBookName("");
            setAlternateTitle("");
            setAuthor("");
            setBookCountAvailable(null);
            setLanguage("");
            setPublisher("");
            setSelectedCategories([]);
            alert("Book Added Successfully 🎉");
        }
        catch (err) {
            console.log(err);
            alert("Failed to add book");
        }
        setIsLoading(false);
    };

    /* Fetch recently added books */
    useEffect(() => {
        const getallBooks = async () => {
            try {
                const response = await axios.get(API_URL + "/api/books/allbooks");
                setRecentAddedBooks(response.data.slice(0, 5));
            } catch (err) {
                console.log(err);
            }
        };
        getallBooks();
    }, [API_URL]);

    return (
        <div className="admin-workflow-page">
            <div className="admin-page-header">
                <div>
                    <p className="dashboard-option-title">Book Registration</p>
                    <p className="admin-page-subtitle">Add a title to the catalogue and keep category, copy and publisher details ready for circulation.</p>
                </div>
                <span className="admin-page-badge">Catalogue</span>
            </div>
            <div className="dashboard-title-line"></div>

            <section className="admin-panel">
            <form className='addbook-form admin-form' onSubmit={addBook}>

                <label className="addbook-form-label" htmlFor="bookName">
                    Book Name<span className="required-field">*</span>
                </label><br />
                <input
                    className="addbook-form-input"
                    type="text"
                    name="bookName"
                    value={bookName}
                    onChange={(e) => { setBookName(e.target.value); }}
                    required
                /><br />

                <label className="addbook-form-label" htmlFor="alternateTitle">Alternate Title</label><br />
                <input
                    className="addbook-form-input"
                    type="text"
                    name="alternateTitle"
                    value={alternateTitle}
                    onChange={(e) => { setAlternateTitle(e.target.value); }}
                /><br />

                <label className="addbook-form-label" htmlFor="author">
                    Author Name<span className="required-field">*</span>
                </label><br />
                <input
                    className="addbook-form-input"
                    type="text"
                    name="author"
                    value={author}
                    onChange={(e) => { setAuthor(e.target.value); }}
                    required
                /><br />

                <label className="addbook-form-label" htmlFor="language">Language</label><br />
                <input
                    className="addbook-form-input"
                    type="text"
                    name="language"
                    value={language}
                    onChange={(e) => { setLanguage(e.target.value); }}
                /><br />

                <label className="addbook-form-label" htmlFor="publisher">Publisher</label><br />
                <input
                    className="addbook-form-input"
                    type="text"
                    name="publisher"
                    value={publisher}
                    onChange={(e) => { setPublisher(e.target.value); }}
                /><br />

                <label className="addbook-form-label" htmlFor="copies">
                    No. of Copies Available<span className="required-field">*</span>
                </label><br />
                <input
                    className="addbook-form-input"
                    type="number"
                    name="copies"
                    value={bookCountAvailable || ""}
                    onChange={(e) => { setBookCountAvailable(e.target.value); }}
                    required
                /><br />

                {/* Categories Dropdown */}
                <label className="addbook-form-label" htmlFor="categories">
                    Categories<span className="required-field">*</span>
                </label><br />
                <div className="semanticdropdown">
                    <Dropdown
                        placeholder='Select Categories'
                        fluid
                        multiple
                        search
                        selection
                        options={allCategories}
                        value={selectedCategories}
                        onChange={(event, { value }) => setSelectedCategories(value)}
                    />
                </div>

                <input
                    className="addbook-submit"
                    type="submit"
                    value={isLoading ? "SAVING..." : "SAVE BOOK"}
                    disabled={isLoading}
                />
            </form>
            </section>

            <section className="admin-panel admin-table-panel">
                <div className="admin-section-heading">
                    <p className="dashboard-option-title">Recent Book Records</p>
                    <span>{recentAddedBooks.length} latest</span>
                </div>
                <div className="admin-table-scroll">
                <table className='admindashboard-table'>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Book Name</th>
                            <th>Added Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            recentAddedBooks.map((book, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{book.bookName}</td>
                                    <td>{book.createdAt ? moment(book.createdAt).format("DD-MM-YYYY") : ""}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                </div>
            </section>
        </div>
    );
}

export default AddBook;
