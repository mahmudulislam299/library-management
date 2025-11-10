import React, { useContext, useEffect, useState } from 'react';
import "../AdminDashboard.css";
import axios from "axios";
import { AuthContext } from '../../../../Context/AuthContext';
import { Dropdown } from 'semantic-ui-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

function AddTransaction() {

    const API_URL = process.env.REACT_APP_API_URL;
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const [borrowerId, setBorrowerId] = useState("");
    const [borrowerDetails, setBorrowerDetails] = useState([]);
    const [bookId, setBookId] = useState("");
    const [bookDetails, setBookDetails] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [allBooks, setAllBooks] = useState([]);

    const [fromDate, setFromDate] = useState(null);
    const [fromDateString, setFromDateString] = useState(null);

    const [toDate, setToDate] = useState(null);
    const [toDateString, setToDateString] = useState(null);

    const transactionTypes = [
        { value: 'Reserved', text: 'Reserve' },
        { value: 'Issued', text: 'Issue' }
    ];

    const [transactionType, setTransactionType] = useState("");

    /* Adding a Transaction */
    const addTransaction = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (bookId !== "" && borrowerId !== "" && transactionType !== "" && fromDate !== null && toDate !== null) {
            const borrower_details = await axios.get(API_URL + "api/users/getuser/" + borrowerId);
            const book_details = await axios.get(API_URL + "api/books/getbook/" + bookId);

            /* Checking whether the book is available or not */
            if (
                (book_details.data.bookCountAvailable > 0 &&
                    (transactionType === "Issued" || transactionType === "Reserved")) ||
                (book_details.data.bookCountAvailable === 0 && transactionType === "Reserved")
            ) {
                const transactionData = {
                    bookId: bookId,
                    borrowerId: borrowerId,
                    borrowerName: borrower_details.data.userFullName,
                    bookName: book_details.data.bookName,
                    transactionType: transactionType,
                    // ✅ store in DD-MM-YYYY format
                    fromDate: fromDateString,
                    toDate: toDateString,
                    isAdmin: user.isAdmin
                };

                try {
                    const response = await axios.post(API_URL + "api/transactions/add-transaction", transactionData);
                    if (recentTransactions.length >= 5) {
                        recentTransactions.splice(-1);
                    }

                    await axios.put(API_URL + `api/users/${response.data._id}/move-to-activetransactions`, {
                        userId: borrowerId,
                        isAdmin: user.isAdmin
                    });

                    await axios.put(API_URL + "api/books/updatebook/" + bookId, {
                        isAdmin: user.isAdmin,
                        bookCountAvailable: book_details.data.bookCountAvailable - 1
                    });

                    setRecentTransactions([response.data, ...recentTransactions]);
                    setBorrowerId("");
                    setBookId("");
                    setTransactionType("");
                    setFromDate(null);
                    setToDate(null);
                    setFromDateString(null);
                    setToDateString(null);
                    setBookDetails(null);
                    alert("Transaction was Successfull 🎉");
                }
                catch (err) {
                    console.log(err);
                }
            }
            else {
                alert("The book is not available");
            }
        }
        else {
            alert("Fields must not be empty");
        }
        setIsLoading(false);
    };


    /* Fetch Transactions */
    useEffect(() => {
        const getTransactions = async () => {
            try {
                const response = await axios.get(API_URL + "api/transactions/all-transactions");
                setRecentTransactions(response.data.slice(0, 5));
            }
            catch (err) {
                console.log("Error in fetching transactions");
            }

        };
        getTransactions();
    }, [API_URL]);


    /* Fetching borrower details */
    useEffect(() => {
        const getBorrowerDetails = async () => {
            try {
                if (borrowerId !== "") {
                    const response = await axios.get(API_URL + "api/users/getuser/" + borrowerId);
                    setBorrowerDetails(response.data);
                } else {
                    setBorrowerDetails([]);
                }
            }
            catch (err) {
                console.log("Error in getting borrower details");
            }
        };
        getBorrowerDetails();
    }, [API_URL, borrowerId]);


    /* Fetching members */
    useEffect(() => {
        const getMembers = async () => {
            try {
                const response = await axios.get(API_URL + "api/users/allmembers");
                const all_members = response.data.map(member => (
                    {
                        value: `${member?._id}`,
                        text: `${member?.userType === "Student"
                            ? `${member?.userFullName}[${member?.admissionId}]`
                            : `${member?.userFullName}[${member?.employeeId}]`
                        }`
                    }
                ));
                setAllMembers(all_members);
            }
            catch (err) {
                console.log(err);
            }
        };
        getMembers();
    }, [API_URL]);


    /* Fetching books */
    useEffect(() => {
        const getallBooks = async () => {
            try {
                const response = await axios.get(API_URL + "api/books/allbooks");
                const allbooks = response.data.map(book => (
                    { value: `${book._id}`, text: `${book.bookName}` }
                ));
                setAllBooks(allbooks);
            } catch (err) {
                console.log(err);
            }
        };
        getallBooks();
    }, [API_URL]);


    /* Fetching selected book details */
    useEffect(() => {
        const getBookDetails = async () => {
            try {
                if (bookId !== "") {
                    const response = await axios.get(API_URL + "api/books/getbook/" + bookId);
                    setBookDetails(response.data);
                } else {
                    setBookDetails(null);
                }
            } catch (err) {
                console.log("Error in getting book details");
            }
        };
        getBookDetails();
    }, [API_URL, bookId]);


    return (
        <div>
            <p className="dashboard-option-title">Add a Transaction</p>
            <div className="dashboard-title-line"></div>
            <form className='transaction-form' onSubmit={addTransaction}>
                <label className="transaction-form-label" htmlFor="borrowerId">
                    Borrower<span className="required-field">*</span>
                </label><br />
                <div className='semanticdropdown'>
                    <Dropdown
                        placeholder='Select Member'
                        fluid
                        search
                        selection
                        value={borrowerId}
                        options={allMembers}
                        onChange={(event, data) => setBorrowerId(data.value)}
                    />
                </div>

                <table
                    className="admindashboard-table shortinfo-table"
                    style={borrowerId === "" ? { display: "none" } : {}}
                >
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Issued</th>
                            <th>Reserved</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{borrowerDetails.userFullName}</td>
                            <td>
                                {borrowerDetails.activeTransactions?.filter((data) => {
                                    return data.transactionType === "Issued" && data.transactionStatus === "Active";
                                }).length}
                            </td>
                            <td>
                                {borrowerDetails.activeTransactions?.filter((data) => {
                                    return data.transactionType === "Reserved" && data.transactionStatus === "Active";
                                }).length}
                            </td>
                            <td>{borrowerDetails.points}</td>
                        </tr>
                    </tbody>
                </table>

                <table
                    className="admindashboard-table shortinfo-table"
                    style={borrowerId === "" ? { display: "none" } : {}}
                >
                    <thead>
                        <tr>
                            <th>Book-Name</th>
                            <th>Transaction</th>
                            <th>From Date<br /><span style={{ fontSize: "10px" }}>[DD-MM-YYYY]</span></th>
                            <th>To Date<br /><span style={{ fontSize: "10px" }}>[DD-MM-YYYY]</span></th>
                            <th>Fine</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            borrowerDetails.activeTransactions?.filter((data) => {
                                return data.transactionStatus === "Active";
                            }).map((data, index) => {
                                // ✅ robust parsing for different possible stored formats
                                const toMoment = moment(data.toDate, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).startOf("day");
                                const today = moment().startOf("day");
                                const daysLate = today.diff(toMoment, "days");
                                const fine = daysLate > 0 ? daysLate * 10 : 0;

                                return (
                                    <tr key={index}>
                                        <td>{data.bookName}</td>
                                        <td>{data.transactionType}</td>
                                        <td>{moment(data.fromDate, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).format("DD-MM-YYYY")}</td>
                                        <td>{toMoment.format("DD-MM-YYYY")}</td>
                                        <td>{fine}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>

                <label className="transaction-form-label" htmlFor="bookName">
                    Book Name<span className="required-field">*</span>
                </label><br />
                <div className='semanticdropdown'>
                    <Dropdown
                        placeholder='Select a Book'
                        fluid
                        search
                        selection
                        options={allBooks}
                        value={bookId}
                        onChange={(event, data) => setBookId(data.value)}
                    />
                </div>

                {/* Available Copies & Reserved summary for selected book */}
                <table
                    className="admindashboard-table shortinfo-table"
                    style={bookId === "" ? { display: "none" } : {}}
                >
                    <thead>
                        <tr>
                            <th>Available Copies</th>
                            <th>Reserved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookDetails && (
                            <tr>
                                <td>{bookDetails.bookCountAvailable}</td>
                                <td>
                                    {bookDetails.transactions
                                        ? bookDetails.transactions.filter(
                                            (t) =>
                                                t.transactionType === "Reserved" &&
                                                t.transactionStatus === "Active"
                                        ).length
                                        : 0}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <label className="transaction-form-label" htmlFor="transactionType">
                    Transaction Type<span className="required-field">*</span>
                </label><br />
                <div className='semanticdropdown'>
                    <Dropdown
                        placeholder='Select Transaction'
                        fluid
                        selection
                        value={transactionType}
                        options={transactionTypes}
                        onChange={(event, data) => setTransactionType(data.value)}
                    />
                </div>
                <br />

                <label className="transaction-form-label" htmlFor="from-date">
                    From Date<span className="required-field">*</span>
                </label><br />
                <DatePicker
                    className="date-picker"
                    placeholderText="DD-MM-YYYY"
                    selected={fromDate}
                    onChange={(date) => {
                        setFromDate(date);
                        // ✅ store as DD-MM-YYYY
                        setFromDateString(moment(date).format("DD-MM-YYYY"));
                    }}
                    minDate={new Date()}
                    // ✅ react-datepicker uses date-fns: use lowercase tokens
                    dateFormat="dd-MM-yyyy"
                />

                <label className="transaction-form-label" htmlFor="to-date">
                    To Date<span className="required-field">*</span>
                </label><br />
                <DatePicker
                    className="date-picker"
                    placeholderText="DD-MM-YYYY"
                    selected={toDate}
                    onChange={(date) => {
                        setToDate(date);
                        // ✅ store as DD-MM-YYYY
                        setToDateString(moment(date).format("DD-MM-YYYY"));
                    }}
                    minDate={new Date()}
                    dateFormat="dd-MM-yyyy"
                />

                <input
                    className="transaction-form-submit"
                    type="submit"
                    value="SUBMIT"
                    disabled={isLoading}
                />
            </form>

            <p className="dashboard-option-title">Recent Transactions</p>
            <div className="dashboard-title-line"></div>
            <table className="admindashboard-table">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Book Name</th>
                        <th>Borrower Name</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        recentTransactions.map((transaction, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{transaction.bookName}</td>
                                    <td>{transaction.borrowerName}</td>
                                    {/* ✅ updatedAt shown as DD-MM-YYYY */}
                                    <td>{moment(transaction.updatedAt).format("DD-MM-YYYY")}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}

export default AddTransaction;
