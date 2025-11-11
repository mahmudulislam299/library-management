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
          .filter((data) => data.transactionStatus === "Active")
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

  const returnBook = async (transactionId, borrowerId, bookId, due) => {
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

      /* Getting borrower points already existed */
      const borrowerdata = await axios.get(
        `${API_URL}/api/users/getuser/${borrowerId}`
      );
      const points = borrowerdata.data.points || 0;

      /* If the number of days after dueDate is greater than zero then decreasing points by 10 else increase by 10*/
      if (due > 0) {
        await axios.put(`${API_URL}/api/users/updateuser/${borrowerId}`, {
          points: points - 10,
          isAdmin: user.isAdmin,
        });
      } else {
        await axios.put(`${API_URL}/api/users/updateuser/${borrowerId}`, {
          points: points + 10,
          isAdmin: user.isAdmin,
        });
      }

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

  const convertToIssue = async (transactionId) => {
    try {
      await axios.put(
        `${API_URL}/api/transactions/update-transaction/${transactionId}`,
        {
          transactionType: "Issued",
          isAdmin: user.isAdmin,
        }
      );
      setExecutionStatus("Completed");
      alert("Book issued succesfully 🎆");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="semanticdropdown returnbook-dropdown">
        <Dropdown
          placeholder="Select Member"
          fluid
          search
          selection
          value={borrowerId}
          options={allMembersOptions}
          onChange={(event, data) => setBorrowerId(data.value)}
        />
      </div>

      <p className="dashboard-option-title">Issued</p>
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
          {allTransactions
            ?.filter((data) => {
              if (!borrowerId) {
                return data.transactionType === "Issued";
              } else {
                return (
                  data.borrowerId === borrowerId &&
                  data.transactionType === "Issued"
                );
              }
            })
            .map((data, index) => {
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
                  <td>{data.borrowerName}</td>
                  <td>{formatDate(data.fromDate)}</td>
                  <td>{formatDate(data.toDate)}</td>
                  <td>{fine}</td>
                  <td>
                    <button
                      onClick={() => {
                        returnBook(
                          data._id,
                          data.borrowerId,
                          data.bookId,
                          daysLate
                        );
                      }}
                    >
                      Return
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <p className="dashboard-option-title">Reserved</p>
      <table className="admindashboard-table">
        <thead>
          <tr>
            <th>Book Name</th>
            <th>Borrower Name</th>
            <th>From Date</th>
            <th>To Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {allTransactions
            ?.filter((data) => {
              if (!borrowerId) {
                return data.transactionType === "Reserved";
              } else {
                return (
                  data.borrowerId === borrowerId &&
                  data.transactionType === "Reserved"
                );
              }
            })
            .map((data, index) => {
              return (
                <tr key={index}>
                  <td>{data.bookName}</td>
                  <td>{data.borrowerName}</td>
                  <td>{formatDate(data.fromDate)}</td>
                  <td>{formatDate(data.toDate)}</td>
                  <td>
                    <button onClick={() => convertToIssue(data._id)}>
                      Convert
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default Return;
