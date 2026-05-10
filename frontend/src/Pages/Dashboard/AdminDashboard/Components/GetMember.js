import React, { useEffect, useState } from "react";
import "../AdminDashboard.css";
import axios from "axios";
import { Dropdown, Icon } from "semantic-ui-react";
import "../../MemberDashboard/MemberDashboard.css";
import moment from "moment";

function GetMember() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [allMembers, setAllMembers] = useState([]);
  const [allMembersOptions, setAllMembersOptions] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [memberDetails, setMemberDetails] = useState(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parsed = moment(dateStr, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]);
    return parsed.isValid() ? parsed : null;
  };

  const formatDate = (dateStr) => {
    const parsed = parseDate(dateStr);
    return parsed ? parsed.format("DD-MM-YYYY") : "Not set";
  };

  const getDaysLate = (transaction) => {
    const dueDate = parseDate(transaction?.toDate);
    if (!dueDate) return 0;

    const daysLate = moment().startOf("day").diff(dueDate.startOf("day"), "days");
    return daysLate > 0 ? daysLate : 0;
  };

  const getFine = (transaction) => getDaysLate(transaction) * 10;

  const getDaysLeft = (transaction) => {
    const dueDate = parseDate(transaction?.toDate);
    if (!dueDate) return null;

    return dueDate.startOf("day").diff(moment().startOf("day"), "days");
  };

  useEffect(() => {
    const getMembers = async () => {
      setIsLoadingMembers(true);
      setErrorMessage("");

      try {
        const response = await axios.get(`${API_URL}/api/users/allmembers`);
        const members = response.data || [];
        const options = members.map((member) => ({
          value: member?._id,
          text:
            member?.userType === "Student"
              ? `${member?.userFullName} [Admission ID: ${member?.memberId}]`
              : `${member?.userFullName} [Employee ID: ${member?.memberId}]`,
        }));

        setAllMembers(members);
        setAllMembersOptions(options);
      } catch (err) {
        console.log("Error fetching members", err);
        setErrorMessage("Could not load members. Please try again.");
      } finally {
        setIsLoadingMembers(false);
      }
    };

    getMembers();
  }, [API_URL]);

  useEffect(() => {
    const getMemberDetails = async () => {
      if (!memberId) {
        setMemberDetails(null);
        return;
      }

      setIsLoadingDetails(true);
      setErrorMessage("");

      try {
        const response = await axios.get(`${API_URL}/api/users/getuser/${memberId}`);
        setMemberDetails(response.data);
      } catch (err) {
        console.log("Error in fetching the member details", err);
        setErrorMessage("Could not load this member's details.");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    getMemberDetails();
  }, [API_URL, memberId]);

  const students = allMembers.filter((member) => member.userType === "Student");
  const employees = allMembers.filter((member) => member.userType === "Employee");
  const allActiveTransactions = allMembers.flatMap(
    (member) => member.activeTransactions || []
  );
  const memberStats = {
    total: allMembers.length,
    students: students.length,
    employees: employees.length,
    activeTransactions: allActiveTransactions.length,
  };

  const activeTransactions = memberDetails?.activeTransactions || [];
  const previousTransactions = memberDetails?.prevTransactions || [];
  const issuedBooks = activeTransactions.filter(
    (item) => item.transactionType === "Issued"
  );
  const reservedBooks = activeTransactions.filter(
    (item) => item.transactionType === "Reserved"
  );
  const overdueBooks = issuedBooks.filter((item) => getDaysLate(item) > 0);
  const dueSoonBooks = issuedBooks.filter((item) => {
    const daysLeft = getDaysLeft(item);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  });
  const totalFine = issuedBooks.reduce((sum, item) => sum + getFine(item), 0);
  const latestTransaction = [...activeTransactions, ...previousTransactions]
    .slice()
    .sort((a, b) => {
      const bDate = parseDate(b.createdAt) || parseDate(b.fromDate) || moment(0);
      const aDate = parseDate(a.createdAt) || parseDate(a.fromDate) || moment(0);
      return bDate.valueOf() - aDate.valueOf();
    })[0];

  const insight = {
    issuedBooks,
    reservedBooks,
    previousTransactions,
    overdueBooks,
    dueSoonBooks,
    totalFine,
    latestTransaction,
  };

  const renderEmptyRow = (colSpan, message) => (
    <tr>
      <td colSpan={colSpan} className="member-empty-row">
        {message}
      </td>
    </tr>
  );

  const renderTransactionStatus = (transaction) => {
    const daysLate = getDaysLate(transaction);
    const daysLeft = getDaysLeft(transaction);

    if (daysLate > 0) {
      return <span className="member-status danger">Overdue by {daysLate} days</span>;
    }

    if (daysLeft !== null && daysLeft <= 3) {
      return <span className="member-status warning">Due in {daysLeft} days</span>;
    }

    return <span className="member-status ok">On time</span>;
  };

  const recentMembers = allMembers.slice(0, 5);

  return (
    <div className="member-insights-page">
      <div className="member-insights-header">
        <div>
          <p className="dashboard-option-title">Member Full Info</p>
          <p className="member-insights-subtitle">
            Profile, circulation status, fines, and borrowing history in one view.
          </p>
        </div>
      </div>
      <div className="dashboard-title-line"></div>

      <div className="member-search-panel">
        <div className="semanticdropdown getmember-dropdown">
          <Dropdown
            placeholder="Search by member name or ID"
            fluid
            search
            clearable
            selection
            loading={isLoadingMembers}
            value={memberId}
            options={allMembersOptions}
            onChange={(event, data) => setMemberId(data.value || "")}
          />
        </div>
        {errorMessage && <p className="member-error-text">{errorMessage}</p>}
      </div>

      {!memberId && (
        <>
          <div className="member-summary-grid">
            <div className="member-summary-card">
              <span>Total Members</span>
              <strong>{memberStats.total}</strong>
            </div>
            <div className="member-summary-card">
              <span>Students</span>
              <strong>{memberStats.students}</strong>
            </div>
            <div className="member-summary-card">
              <span>Employees</span>
              <strong>{memberStats.employees}</strong>
            </div>
            <div className="member-summary-card">
              <span>Active Transactions</span>
              <strong>{memberStats.activeTransactions}</strong>
            </div>
          </div>

          <section className="member-insight-section">
            <div className="member-section-heading">
              <h3>Recently Added Members</h3>
              <span>{isLoadingMembers ? "Loading..." : "Latest records"}</span>
            </div>
            <table className="activebooks-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Member ID</th>
                  <th>Email</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.length === 0
                  ? renderEmptyRow(5, "No members found.")
                  : recentMembers.map((member) => (
                      <tr key={member._id}>
                        <td>{member.userFullName}</td>
                        <td>{member.userType}</td>
                        <td>{member.memberId}</td>
                        <td>{member.email}</td>
                        <td>{member.activeTransactions?.length || 0}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {memberId && isLoadingDetails && (
        <div className="member-loading-state">Loading member profile...</div>
      )}

      {memberId && memberDetails && !isLoadingDetails && (
        <>
          <section className="member-profile-content member-insight-section">
            <div className="user-details-topbar">
              <img
                className="user-profileimage"
                src={memberDetails.photo || "./assets/images/Profile.png"}
                alt=""
              />
              <div className="user-info">
                <div className="user-name-row">
                  <p className="user-name">{memberDetails.userFullName}</p>
                  <span className="user-type-pill">{memberDetails.userType}</span>
                </div>
                <p className="user-id">
                  {memberDetails.userType === "Student"
                    ? "Admission ID: "
                    : "Employee ID: "}
                  {memberDetails.memberId}
                </p>
                <p className="user-email">
                  <Icon name="mail" /> {memberDetails.email}
                </p>
                <p className="user-phone">
                  <Icon name="phone" /> {memberDetails.mobileNumber}
                </p>
              </div>
            </div>

            <div className="member-summary-grid compact">
              <div className="member-summary-card">
                <span>Issued Now</span>
                <strong>{insight.issuedBooks.length}</strong>
              </div>
              <div className="member-summary-card">
                <span>Reserved</span>
                <strong>{insight.reservedBooks.length}</strong>
              </div>
              <div className="member-summary-card danger">
                <span>Overdue</span>
                <strong>{insight.overdueBooks.length}</strong>
              </div>
              <div className="member-summary-card">
                <span>Estimated Fine</span>
                <strong>{insight.totalFine} BDT</strong>
              </div>
            </div>

            <div className="profile-info-grid member-profile-grid">
              <div className="profile-info-card">
                <p className="profile-info-label">Department</p>
                <p className="profile-info-value">
                  {memberDetails.department || "Not provided"}
                </p>
              </div>
              <div className="profile-info-card">
                <p className="profile-info-label">Gender</p>
                <p className="profile-info-value">
                  {memberDetails.gender || "Not provided"}
                </p>
              </div>
              <div className="profile-info-card">
                <p className="profile-info-label">Age / Date of Birth</p>
                <p className="profile-info-value">
                  {memberDetails.age || "N/A"} / {memberDetails.dob || "N/A"}
                </p>
              </div>
              <div className="profile-info-card">
                <p className="profile-info-label">Library Points</p>
                <p className="profile-info-value">{memberDetails.points || 0}</p>
              </div>
              <div className="profile-info-card">
                <p className="profile-info-label">Joined</p>
                <p className="profile-info-value">
                  {formatDate(memberDetails.createdAt)}
                </p>
              </div>
              <div className="profile-info-card">
                <p className="profile-info-label">Last Activity</p>
                <p className="profile-info-value">
                  {insight.latestTransaction
                    ? `${insight.latestTransaction.bookName} (${formatDate(
                        insight.latestTransaction.fromDate
                      )})`
                    : "No transaction yet"}
                </p>
              </div>
              <div className="profile-info-card wide">
                <p className="profile-info-label">Address</p>
                <p className="profile-info-value">
                  {memberDetails.address || "Not provided"}
                </p>
              </div>
            </div>
          </section>

          <section className="member-insight-section">
            <div className="member-section-heading">
              <h3>Attention Needed</h3>
              <span>
                {insight.overdueBooks.length + insight.dueSoonBooks.length} items
              </span>
            </div>
            <div className="member-alert-grid">
              <div className="member-alert-card danger">
                <span>Overdue Books</span>
                <strong>{insight.overdueBooks.length}</strong>
                <p>
                  {insight.overdueBooks.length
                    ? `${insight.totalFine} BDT estimated fine so far`
                    : "No overdue issued books"}
                </p>
              </div>
              <div className="member-alert-card warning">
                <span>Due Soon</span>
                <strong>{insight.dueSoonBooks.length}</strong>
                <p>
                  {insight.dueSoonBooks.length
                    ? "Issued books due within 3 days"
                    : "No near due dates"}
                </p>
              </div>
            </div>
          </section>

          <section className="member-insight-section">
            <div className="member-section-heading">
              <h3>Issued Books</h3>
              <span>{insight.issuedBooks.length} active</span>
            </div>
            <table className="activebooks-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Book Name</th>
                  <th>From Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                {insight.issuedBooks.length === 0
                  ? renderEmptyRow(6, "No currently issued books.")
                  : insight.issuedBooks.map((data, index) => (
                      <tr key={data._id || index}>
                        <td>{index + 1}</td>
                        <td>{data.bookName}</td>
                        <td>{formatDate(data.fromDate)}</td>
                        <td>{formatDate(data.toDate)}</td>
                        <td>{renderTransactionStatus(data)}</td>
                        <td>{getFine(data)} BDT</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </section>

          <section className="member-insight-section">
            <div className="member-section-heading">
              <h3>Reserved Books</h3>
              <span>{insight.reservedBooks.length} active</span>
            </div>
            <table className="activebooks-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Book Name</th>
                  <th>Reserved From</th>
                  <th>Reserved Until</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {insight.reservedBooks.length === 0
                  ? renderEmptyRow(5, "No reserved books.")
                  : insight.reservedBooks.map((data, index) => (
                      <tr key={data._id || index}>
                        <td>{index + 1}</td>
                        <td>{data.bookName}</td>
                        <td>{formatDate(data.fromDate)}</td>
                        <td>{formatDate(data.toDate)}</td>
                        <td>{data.transactionStatus || "Active"}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </section>

          <section className="member-insight-section">
            <div className="member-section-heading">
              <h3>Borrowing History</h3>
              <span>{insight.previousTransactions.length} completed</span>
            </div>
            <table className="activebooks-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Book Name</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Returned</th>
                </tr>
              </thead>
              <tbody>
                {insight.previousTransactions.length === 0
                  ? renderEmptyRow(6, "No previous transaction history.")
                  : insight.previousTransactions.map((data, index) => (
                      <tr key={data._id || index}>
                        <td>{index + 1}</td>
                        <td>{data.bookName}</td>
                        <td>{data.transactionType}</td>
                        <td>{formatDate(data.fromDate)}</td>
                        <td>{formatDate(data.toDate)}</td>
                        <td>{formatDate(data.returnDate)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

export default GetMember;
