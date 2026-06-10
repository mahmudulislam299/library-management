import React, { useContext, useEffect, useState } from "react";
import "../AdminDashboard.css";
import axios from "axios";
import { AuthContext } from "../../../../Context/AuthContext";
import { Dropdown } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

function AddTransaction() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const [borrowerId, setBorrowerId] = useState("");
  const [borrowerDetails, setBorrowerDetails] = useState({});
  const [bookId, setBookId] = useState("");
  const [bookDetails, setBookDetails] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [allBooks, setAllBooks] = useState([]);

  const [fromDate, setFromDate] = useState(null);
  const [fromDateString, setFromDateString] = useState(null);

  const [toDate, setToDate] = useState(null);
  const [toDateString, setToDateString] = useState(null);

  // Configurable periods
  const ISSUE_PERIOD_DAYS = 10;
  const RECENT_TRANSACTION_LIMIT = 30;

  // Helper: add N days to a JS Date
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  /* Adding a Transaction */
  const addTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      bookId !== "" &&
      borrowerId !== "" &&
      fromDate !== null &&
      toDate !== null
    ) {
      const borrower_details = await axios.get(
        `${API_URL}/api/users/getuser/${borrowerId}`
      );
      const book_details = await axios.get(
        `${API_URL}/api/books/getbook/${bookId}`
      );

      /* Checking whether the book is available or not */
      if (book_details.data.bookCountAvailable > 0) {
        const transactionData = {
          bookId: bookId,
          borrowerId: borrowerId,
          borrowerName: borrower_details.data.userFullName,
          bookName: book_details.data.bookName,
          transactionType: "Issued",
          // store as DD-MM-YYYY
          fromDate: fromDateString,
          toDate: toDateString,
          isAdmin: user.isAdmin,
        };

        try {
          const response = await axios.post(
            `${API_URL}/api/transactions/add-transaction`,
            transactionData
          );

          await axios.put(
            `${API_URL}/api/users/${response.data._id}/move-to-activetransactions`,
            {
              userId: borrowerId,
              isAdmin: user.isAdmin,
            }
          );

          await axios.put(`${API_URL}/api/books/updatebook/${bookId}`, {
            isAdmin: user.isAdmin,
            bookCountAvailable: book_details.data.bookCountAvailable - 1,
          });

          setRecentTransactions((prev) =>
            [response.data, ...prev].slice(0, RECENT_TRANSACTION_LIMIT)
          );
          setBorrowerId("");
          setBookId("");
          setFromDate(null);
          setToDate(null);
          setFromDateString(null);
          setToDateString(null);
          setBookDetails(null);
          alert("Transaction was Successfull 🎉");
        } catch (err) {
          console.log(err);
        }
      } else {
        alert("The book is not available");
      }
    } else {
      alert("Fields must not be empty");
    }
    setIsLoading(false);
  };

  /* Fetch Transactions */
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/transactions/all-transactions`
        );
        setRecentTransactions(
          response.data
            .filter((transaction) => transaction.transactionType === "Issued")
            .slice(0, RECENT_TRANSACTION_LIMIT)
        );
      } catch (err) {
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
          const response = await axios.get(
            `${API_URL}/api/users/getuser/${borrowerId}`
          );
          setBorrowerDetails(response.data);
        } else {
          setBorrowerDetails({});
        }
      } catch (err) {
        console.log("Error in getting borrower details");
      }
    };
    getBorrowerDetails();
  }, [API_URL, borrowerId]);

  /* Fetching members */
  useEffect(() => {
    const getMembers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/allmembers`);
        const all_members = response.data.map((member) => ({
          value: `${member?._id}`,
          text:
            member?.userType === "Student"
              ? `${member?.userFullName} [Admission ID: ${member?.memberId}]`
              : `${member?.userFullName} [Employee ID: ${member?.memberId}]`,
        }));
        setAllMembers(all_members);
      } catch (err) {
        console.log(err);
      }
    };
    getMembers();
  }, [API_URL]);

  /* Fetching books */
  useEffect(() => {
    const getallBooks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/books/allbooks`);
        const allbooks = response.data.map((book) => ({
          value: `${book._id}`,
          text: `${book.bookName}`,
        }));
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
          const response = await axios.get(
            `${API_URL}/api/books/getbook/${bookId}`
          );
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

  const activeBorrowerTransactions =
    borrowerDetails.activeTransactions?.filter((data) => {
      return (
        data.transactionStatus === "Active" &&
        data.transactionType === "Issued"
      );
    }) || [];

  return (
    <div className="admin-workflow-page">
      <div className="admin-page-header">
        <div>
          <p className="dashboard-option-title">Issue Book</p>
          <p className="admin-page-subtitle">
            Select a member, choose an available book, and let the system calculate the return date.
          </p>
        </div>
        <span className="admin-page-badge">Issue</span>
      </div>
      <div className="dashboard-title-line"></div>

      <section className="admin-panel">
      <form className="transaction-form admin-form" onSubmit={addTransaction}>
        <label className="transaction-form-label" htmlFor="borrowerId">
          Borrower<span className="required-field">*</span>
        </label>
        <br />
        <div className="semanticdropdown">
          <Dropdown
            placeholder="Select Member"
            fluid
            search
            selection
            value={borrowerId}
            options={allMembers}
            onChange={(event, data) => setBorrowerId(data.value)}
          />
        </div>

        <table
          className="admindashboard-table shortinfo-table insight-table"
          style={borrowerId === "" ? { display: "none" } : {}}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Issued</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{borrowerDetails.userFullName}</td>
              <td>
                {borrowerDetails.activeTransactions?.filter((data) => {
                  return (
                    data.transactionType === "Issued" &&
                    data.transactionStatus === "Active"
                  );
                }).length}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          className="admin-table-scroll"
          style={borrowerId === "" ? { display: "none" } : {}}
        >
        <table className="admindashboard-table shortinfo-table insight-table">
          <thead>
            <tr>
              <th>Book-Name</th>
              <th>Transaction</th>
              <th>
                From Date
                <br />
                <span style={{ fontSize: "10px" }}>[DD-MM-YYYY]</span>
              </th>
              <th>
                To Date
                <br />
                <span style={{ fontSize: "10px" }}>[DD-MM-YYYY]</span>
              </th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {activeBorrowerTransactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="member-empty-row">
                  No active records for this member.
                </td>
              </tr>
            ) : (
              activeBorrowerTransactions.map((data, index) => {
                const toMoment = moment(
                  data.toDate,
                  ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
                ).startOf("day");
                const today = moment().startOf("day");
                const daysLate = today.diff(toMoment, "days");
                const fine = daysLate > 0 ? daysLate * 10 : 0;

                return (
                  <tr key={index}>
                    <td>{data.bookName}</td>
                    <td>{data.transactionType}</td>
                    <td>
                      {moment(
                        data.fromDate,
                        ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
                      ).format("DD-MM-YYYY")}
                    </td>
                    <td>{toMoment.format("DD-MM-YYYY")}</td>
                    <td>{fine}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        <label className="transaction-form-label" htmlFor="bookName">
          Book Name<span className="required-field">*</span>
        </label>
        <br />
        <div className="semanticdropdown">
          <Dropdown
            placeholder="Select a Book"
            fluid
            search
            selection
            options={allBooks}
            value={bookId}
            onChange={(event, data) => setBookId(data.value)}
          />
        </div>

        {/* Available copies for selected book */}
        <table
          className="admindashboard-table shortinfo-table insight-table"
          style={bookId === "" ? { display: "none" } : {}}
        >
          <thead>
            <tr>
              <th>Available Copies</th>
            </tr>
          </thead>
          <tbody>
            {bookDetails && (
              <tr>
                <td>{bookDetails.bookCountAvailable}</td>
              </tr>
            )}
          </tbody>
        </table>

        <label className="transaction-form-label" htmlFor="from-date">
          From Date<span className="required-field">*</span>
        </label>
        <br />
        <DatePicker
          className="date-picker"
          placeholderText="DD-MM-YYYY"
          selected={fromDate}
          onChange={(date) => {
            setFromDate(date);
            const fromStr = moment(date).format("DD-MM-YYYY");
            setFromDateString(fromStr);

            const autoTo = addDays(date, ISSUE_PERIOD_DAYS);
            setToDate(autoTo);
            setToDateString(moment(autoTo).format("DD-MM-YYYY"));
          }}
          minDate={new Date()}
          dateFormat="dd-MM-yyyy"
        />

        <label className="transaction-form-label" htmlFor="to-date">
          To Date<span className="required-field">*</span>
        </label>
        <br />
        <DatePicker
          className="date-picker"
          placeholderText="DD-MM-YYYY"
          selected={toDate}
          onChange={() => {}}
          minDate={fromDate || new Date()}
          dateFormat="dd-MM-yyyy"
          disabled
        />

        <input
          className="transaction-form-submit"
          type="submit"
          value={isLoading ? "SAVING..." : "ISSUE BOOK"}
          disabled={isLoading}
        />
      </form>
      </section>

      <section className="admin-panel admin-table-panel">
      <div className="admin-section-heading">
        <p className="dashboard-option-title">Recent Circulation Records</p>
        <span>{recentTransactions.length} latest</span>
      </div>
      <div className="admin-table-scroll">
      <table className="admindashboard-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Book Name</th>
            <th>Borrower Name</th>
            <th>Type</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Record Date</th>
          </tr>
        </thead>
        <tbody>
          {recentTransactions.map((transaction, index) => {
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{transaction.bookName}</td>
                <td>{transaction.borrowerName}</td>
                <td>{transaction.transactionType}</td>
                <td>
                  {moment(
                    transaction.fromDate,
                    ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
                  ).format("DD-MM-YYYY")}
                </td>
                <td>
                  {moment(
                    transaction.toDate,
                    ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
                  ).format("DD-MM-YYYY")}
                </td>
                <td>{transaction.transactionStatus}</td>
                <td>{moment(transaction.createdAt || transaction.updatedAt).format("DD-MM-YYYY")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      </section>
    </div>
  );
}

export default AddTransaction;
