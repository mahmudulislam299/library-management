import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../AdminDashboard.css";
import axios from "axios";
import moment from "moment";

function FineManagement() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("due");

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
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="member-empty-row">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FineManagement;
