import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import "../AdminDashboard.css";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../../../../Context/AuthContext";

function FineManagement() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("due");
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions/all-transactions`);
      setTransactions(response.data || []);
    } catch (err) {
      console.log("Error fetching fine records", err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fineRecords = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          (transaction.fineTotalAccrued || 0) > 0 ||
          (transaction.fineAmountDue || 0) > 0 ||
          (transaction.fineAmountPaid || 0) > 0
      ),
    [transactions]
  );

  const filteredRecords = useMemo(() => {
    const lower = search.toLowerCase();

    return fineRecords.filter((transaction) => {
      const matchesSearch =
        (transaction.bookName || "").toLowerCase().includes(lower) ||
        (transaction.borrowerName || "").toLowerCase().includes(lower) ||
        (transaction.borrowerId || "").toLowerCase().includes(lower) ||
        (transaction.finePaymentReference || "").toLowerCase().includes(lower);
      const due = transaction.fineAmountDue || 0;
      const paid = transaction.fineAmountPaid || 0;

      if (statusFilter === "due") return matchesSearch && due > 0;
      if (statusFilter === "paid") return matchesSearch && due === 0 && paid > 0;
      if (statusFilter === "partial") return matchesSearch && due > 0 && paid > 0;
      return matchesSearch;
    });
  }, [fineRecords, search, statusFilter]);

  const summary = useMemo(
    () =>
      fineRecords.reduce(
        (acc, transaction) => {
          acc.totalAccrued += transaction.fineTotalAccrued || 0;
          acc.totalDue += transaction.fineAmountDue || 0;
          acc.totalPaid += transaction.fineAmountPaid || 0;
          if ((transaction.fineAmountDue || 0) > 0) acc.unpaid += 1;
          if ((transaction.fineAmountDue || 0) === 0 && (transaction.fineAmountPaid || 0) > 0) {
            acc.paid += 1;
          }
          return acc;
        },
        { totalAccrued: 0, totalDue: 0, totalPaid: 0, unpaid: 0, paid: 0 }
      ),
    [fineRecords]
  );

  const formatDate = (date) =>
    date ? moment(date, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).format("DD-MM-YYYY") : "-";

  const getFineStatus = (transaction) => {
    const due = transaction.fineAmountDue || 0;
    const paid = transaction.fineAmountPaid || 0;

    if (due === 0 && paid > 0) return "Paid";
    if (due > 0 && paid > 0) return "Partial";
    if (due > 0) return "Due";
    return "Clear";
  };

  const openPaymentModal = (transaction) => {
    setSelectedFine(transaction);
    setPaymentMethod("bKash");
    setPaymentReference("");
    setPaymentAmount(String(transaction.fineAmountDue || ""));
  };

  const closePaymentModal = () => {
    setSelectedFine(null);
    setPaymentReference("");
    setPaymentAmount("");
    setIsRecording(false);
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFine) return;

    setIsRecording(true);

    try {
      await axios.put(
        `${API_URL}/api/transactions/admin-record-fine-payment/${selectedFine._id}`,
        {
          isAdmin: user?.isAdmin,
          adminId: user?._id,
          amount: Number(paymentAmount),
          paymentMethod,
          paymentReference,
        }
      );
      await fetchTransactions();
      alert("Fine payment recorded.");
      closePaymentModal();
    } catch (err) {
      console.log("Error recording fine payment", err);
      alert(err.response?.data?.message || "Failed to record fine payment.");
      setIsRecording(false);
    }
  };

  return (
    <div className="admin-workflow-page">
      <div className="admin-page-header">
        <div>
          <p className="dashboard-option-title">Fine Tracking</p>
          <p className="admin-page-subtitle">
            Track overdue fines, paid amounts, due balances, and demo payment references in one ledger.
          </p>
        </div>
        <span className="admin-page-badge">{summary.unpaid} due</span>
      </div>
      <div className="dashboard-title-line"></div>

      <div className="fine-admin-summary-grid">
        <div className="fine-admin-card danger">
          <span>Total Due</span>
          <strong>{summary.totalDue} BDT</strong>
        </div>
        <div className="fine-admin-card paid">
          <span>Total Paid</span>
          <strong>{summary.totalPaid} BDT</strong>
        </div>
        <div className="fine-admin-card">
          <span>Total Accrued</span>
          <strong>{summary.totalAccrued} BDT</strong>
        </div>
        <div className="fine-admin-card">
          <span>Paid Records</span>
          <strong>{summary.paid}</strong>
        </div>
      </div>

      <section className="admin-panel fine-admin-controls">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search member, book, ID, or payment reference"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="due">Due only</option>
          <option value="partial">Partial paid</option>
          <option value="paid">Paid</option>
          <option value="all">All fine records</option>
        </select>
      </section>

      <section className="admin-panel admin-table-panel">
        <div className="admin-section-heading">
          <p className="dashboard-option-title">Fine Ledger</p>
          <span>{filteredRecords.length} records</span>
        </div>
        <div className="admin-table-scroll">
          <table className="admindashboard-table fine-admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Due Date</th>
                <th>Days Late</th>
                <th>Accrued</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Payment Info</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="10" className="member-empty-row">
                    No fine records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>
                      <strong>{transaction.borrowerName}</strong>
                      <span className="fine-admin-muted">{transaction.borrowerId}</span>
                    </td>
                    <td>{transaction.bookName}</td>
                    <td>{formatDate(transaction.toDate)}</td>
                    <td>{transaction.fineDaysLate || 0}</td>
                    <td>{transaction.fineTotalAccrued || 0}</td>
                    <td>{transaction.fineAmountPaid || 0}</td>
                    <td>{transaction.fineAmountDue || 0}</td>
                    <td>
                      <span className={`fine-admin-status ${getFineStatus(transaction).toLowerCase()}`}>
                        {getFineStatus(transaction)}
                      </span>
                    </td>
                    <td>
                      {transaction.fineAmountPaid > 0 ? (
                        <div className="fine-admin-payment-info">
                          <strong>{transaction.finePaymentMethod || "Recorded"}</strong>
                          <span>{transaction.finePaymentReference || "No reference"}</span>
                          <span>{formatDate(transaction.finePaidAt)}</span>
                        </div>
                      ) : (
                        <span className="fine-admin-muted">No payment</span>
                      )}
                    </td>
                    <td>
                      {(transaction.fineAmountDue || 0) > 0 && (
                        <button
                          className="return-book-btn"
                          onClick={() => openPaymentModal(transaction)}
                        >
                          Record Fine Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedFine && (
        <div className="fine-admin-overlay" role="dialog" aria-modal="true">
          <form className="fine-admin-modal" onSubmit={recordPayment}>
            <div className="fine-admin-modal-header">
              <div>
                <h3>Record Fine Payment</h3>
                <p>{selectedFine.borrowerName} - {selectedFine.bookName}</p>
              </div>
              <button type="button" onClick={closePaymentModal}>
                Close
              </button>
            </div>

            <div className="fine-admin-amount-box">
              <span>Current due</span>
              <strong>{selectedFine.fineAmountDue || 0} BDT</strong>
            </div>

            <label>
              Amount
              <input
                type="number"
                min="1"
                max={selectedFine.fineAmountDue || undefined}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </label>

            <label>
              Payment Method
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="bKash">bKash</option>
                <option value="Mobile Banking">Mobile Banking</option>
                <option value="Regular Banking">Regular Banking</option>
              </select>
            </label>

            <label>
              Reference / Note
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Transaction ID, account number, or note"
              />
            </label>

            <button className="fine-admin-submit" disabled={isRecording}>
              {isRecording ? "Recording..." : "Save Payment Record"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default FineManagement;
