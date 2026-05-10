import React, { useContext, useEffect, useState } from "react";
import "../AdminDashboard.css";
import axios from "axios";
import { Dropdown } from "semantic-ui-react";
import "../../MemberDashboard/MemberDashboard.css";
import moment from "moment";
import { AuthContext } from "../../../../Context/AuthContext";

function Return() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);

  const [allTransactions, setAllTransactions] = useState([]);
  const [ExecutionStatus, setExecutionStatus] = useState(null); /* For triggering the tabledata to be updated */

  const [allMembersOptions, setAllMembersOptions] = useState([]);
  const [borrowerId, setBorrowerId] = useState("");

  // Small helper for safe date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return moment(dateStr, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).format(
      "DD-MM-YYYY"
    );
  };

  // Fetching all Members
  useEffect(() => {
    const getMembers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/allmembers`);
        setAllMembersOptions(
          response.data.map((member) => ({
            value: `${member?._id}`,
            text:
              member?.userType === "Student"
                ? `${member?.userFullName} [Admission ID: ${member?.memberId}]`
                : `${member?.userFullName} [Employee ID: ${member?.memberId}]`,
          }))
        );
      } catch (err) {
        console.log(err);
      }
    };
    getMembers();
  }, [API_URL]);

  /* Getting all active transactions */
  useEffect(() => {
    const getAllTransactions = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/transactions/all-transactions`
        );
        const activeSorted = response.data
          .filter(
            (data) =>
              data.transactionStatus === "Active" &&
              data.transactionType === "Issued"
          )
          .sort((a, b) => {
            const aTo = moment(
              a.toDate,
              ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
            );
            const bTo = moment(
              b.toDate,
              ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
            );
            return aTo.valueOf() - bTo.valueOf();
          });
        setAllTransactions(activeSorted);
        setExecutionStatus(null);
      } catch (err) {
        console.log(err);
      }
    };
    getAllTransactions();
  }, [API_URL, ExecutionStatus]);

  const returnBook = async (transactionId, borrowerId, bookId) => {
    try {
      /* Setting return date and transactionStatus to completed */
      await axios.put(
        `${API_URL}/api/transactions/update-transaction/${transactionId}`,
        {
          isAdmin: user.isAdmin,
          transactionStatus: "Completed",
          // store as DD-MM-YYYY
          returnDate: moment(new Date()).format("DD-MM-YYYY"),
        }
      );

      const book_details = await axios.get(
        `${API_URL}/api/books/getbook/${bookId}`
      );
      await axios.put(`${API_URL}/api/books/updatebook/${bookId}`, {
        isAdmin: user.isAdmin,
        bookCountAvailable: book_details.data.bookCountAvailable + 1,
      });

      /* Pulling out the transaction id from user active Transactions and pushing to Prev Transactions */
      await axios.put(
        `${API_URL}/api/users/${transactionId}/move-to-prevtransactions`,
        {
          userId: borrowerId,
          isAdmin: user.isAdmin,
        }
      );

      setExecutionStatus("Completed");
      alert("Book returned to the library successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const issuedTransactions =
    allTransactions?.filter((data) => {
      if (!borrowerId) {
        return data.transactionType === "Issued";
      }

      return data.borrowerId === borrowerId && data.transactionType === "Issued";
    }) || [];

  return (
    <div className="admin-workflow-page">
      <div className="admin-page-header">
        <div>
          <p className="dashboard-option-title">Return Desk</p>
          <p className="admin-page-subtitle">
            Review active loans and complete returns.
          </p>
        </div>
        <span className="admin-page-badge">{allTransactions.length} active</span>
      </div>
      <div className="dashboard-title-line"></div>

      <section className="admin-panel return-filter-panel">
      <div className="semanticdropdown returnbook-dropdown">
        <Dropdown
          placeholder="Filter by member"
          fluid
          search
          clearable
          selection
          value={borrowerId}
          options={allMembersOptions}
          onChange={(event, data) => setBorrowerId(data.value || "")}
        />
      </div>
      </section>

      <section className="admin-panel admin-table-panel">
      <div className="admin-section-heading">
        <p className="dashboard-option-title">Issued Books to Return</p>
        <span>{issuedTransactions.length} active</span>
      </div>
      <div className="admin-table-scroll">
      <table className="admindashboard-table">
        <thead>
          <tr>
            <th>Book Name</th>
            <th>Borrower Name</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Fine</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {issuedTransactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="member-empty-row">
                No issued books found.
              </td>
            </tr>
          ) : (
            issuedTransactions.map((data, index) => {
              const toMoment = moment(
                data.toDate,
                ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
              ).startOf("day");
              const today = moment().startOf("day");
              const daysLate = today.diff(toMoment, "days");
              const fine =
                typeof data.fineAmountDue === "number"
                  ? data.fineAmountDue
                  : daysLate > 0
                  ? daysLate * 10
                  : 0;

              return (
                <tr key={index}>
                  <td>{data.bookName}</td>
                  <td>{data.borrowerName}</td>
                  <td>{formatDate(data.fromDate)}</td>
                  <td>{formatDate(data.toDate)}</td>
                  <td>{data.finePaid ? "Paid" : fine}</td>
                  <td>
                    <button
                      className="return-book-btn"
                      onClick={() => {
                        returnBook(
                          data._id,
                          data.borrowerId,
                          data.bookId
                        );
                      }}
                    >
                      Mark Returned
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
      </section>

    </div>
  );
}

export default Return;
