import React, { useCallback, useContext, useEffect, useState } from "react";
import "../AdminDashboard/AdminDashboard.css";
import "./MemberDashboard.css";
import BookLibrary from "../SharedComponents/BookLibrary";

import {
  LibraryBooks,
  AccountCircle,
  History,
  LocalLibrary,
  PowerSettingsNew,
  Close,
  DoubleArrow,
  Payment,
} from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import { AuthContext } from "../../../Context/AuthContext";
import axios from "axios";
import moment from "moment";

function MemberDashboard() {
  const [active, setActive] = useState("profile");
  const [sidebar, setSidebar] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const { user, dispatch } = useContext(AuthContext);
  const [memberDetails, setMemberDetails] = useState(null);
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [paymentReference, setPaymentReference] = useState("");
  const [isPayingFine, setIsPayingFine] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    userFullName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    department: "",
    address: "",
    dob: "",
  });

  const FINE_PER_DAY = 10;

  // 🔁 Common date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return moment(dateStr, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).format(
      "DD-MM-YYYY"
    );
  };

  const getDaysLate = (transaction) => {
    if (typeof transaction?.fineDaysLate === "number") {
      return transaction.fineDaysLate;
    }

    const dueDate = moment(
      transaction?.toDate,
      ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
    ).startOf("day");

    if (!dueDate.isValid()) return 0;

    const daysLate = moment().startOf("day").diff(dueDate, "days");
    return daysLate > 0 ? daysLate : 0;
  };

  const getFineAmount = (transaction) => {
    if (typeof transaction?.fineAmountDue === "number") {
      return transaction.fineAmountDue;
    }

    return getDaysLate(transaction) * FINE_PER_DAY;
  };

  const getRawFineAmount = (transaction) => {
    if (typeof transaction?.fineTotalAccrued === "number") {
      return transaction.fineTotalAccrued;
    }

    return getDaysLate(transaction) * FINE_PER_DAY;
  };

  const refreshMemberDetails = useCallback(async () => {
    if (!user?._id) return;

      try {
        const response = await axios.get(
          `${API_URL}/api/users/getuser/${user._id}`
        );
        setMemberDetails(response.data);
      } catch (err) {
        console.log("Error fetching member details", err);
      }
  }, [API_URL, user]);

  useEffect(() => {
    refreshMemberDetails();
  }, [refreshMemberDetails]);

  useEffect(() => {
    if (!memberDetails) return;

    setProfileForm({
      userFullName: memberDetails.userFullName || "",
      email: memberDetails.email || "",
      mobileNumber: memberDetails.mobileNumber || "",
      gender: memberDetails.gender || "",
      department: memberDetails.department || "",
      address: memberDetails.address || "",
      dob: memberDetails.dob || "",
    });
  }, [memberDetails]);

  const fineTransactions = [
    ...(memberDetails?.activeTransactions || []),
    ...(memberDetails?.prevTransactions || []),
  ].filter((transaction) => getRawFineAmount(transaction) > 0);
  const unpaidFineTransactions = fineTransactions.filter(
    (transaction) => !transaction.finePaid
  );
  const totalDue = unpaidFineTransactions.reduce(
    (sum, transaction) => sum + getFineAmount(transaction),
    0
  );
  const totalPaid = fineTransactions.reduce(
    (sum, transaction) => sum + (transaction.fineAmountPaid || 0),
    0
  );

  const openFinePayment = (transaction) => {
    setSelectedFine(transaction);
    setPaymentMethod("bKash");
    setPaymentReference("");
  };

  const closeFinePayment = () => {
    setSelectedFine(null);
    setPaymentReference("");
    setIsPayingFine(false);
  };

  const payFine = async (e) => {
    e.preventDefault();

    if (!selectedFine) return;

    const amount = getFineAmount(selectedFine);
    if (amount <= 0) {
      alert("There is no unpaid fine for this transaction.");
      closeFinePayment();
      return;
    }

    setIsPayingFine(true);

    try {
      await axios.put(`${API_URL}/api/transactions/pay-fine/${selectedFine._id}`, {
        userId: user._id,
        amount,
        paymentMethod,
        paymentReference,
      });
      await refreshMemberDetails();
      alert("Demo payment completed. Fine cleared.");
      closeFinePayment();
    } catch (err) {
      console.log("Error paying fine", err);
      alert(err.response?.data?.message || "Failed to complete demo payment.");
      setIsPayingFine(false);
    }
  };

  const handleProfileInput = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const cancelProfileEdit = () => {
    if (memberDetails) {
      setProfileForm({
        userFullName: memberDetails.userFullName || "",
        email: memberDetails.email || "",
        mobileNumber: memberDetails.mobileNumber || "",
        gender: memberDetails.gender || "",
        department: memberDetails.department || "",
        address: memberDetails.address || "",
        dob: memberDetails.dob || "",
      });
    }
    setIsEditingProfile(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.userFullName || !profileForm.email || !profileForm.mobileNumber) {
      alert("Name, email, and mobile number are required.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await axios.put(`${API_URL}/api/users/profile/${user._id}`, {
        ...profileForm,
        userId: user._id,
      });
      setMemberDetails(response.data);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          ...user,
          userFullName: response.data.userFullName,
          email: response.data.email,
          mobileNumber: response.data.mobileNumber,
          gender: response.data.gender,
          department: response.data.department,
          address: response.data.address,
          dob: response.data.dob,
        },
      });
      setIsEditingProfile(false);
      alert("Profile information updated.");
    } catch (err) {
      console.log("Error updating profile", err);
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        {/* Sidebar Toggler */}
        <div className="sidebar-toggler" onClick={() => setSidebar(!sidebar)}>
          <IconButton>
            {sidebar ? (
              <Close style={{ fontSize: 28, color: "var(--accent)" }} />
            ) : (
              <DoubleArrow style={{ fontSize: 28, color: "var(--accent)" }} />
            )}
          </IconButton>
        </div>

        {/* Sidebar */}
        <div className={`dashboard-options ${sidebar ? "active" : ""}`}>
          <div className="dashboard-logo">
            <LibraryBooks style={{ fontSize: 50, color: "var(--gold)" }} />
            <p className="logo-name">LCMS</p>
          </div>

          <p
            className={`dashboard-option ${
              active === "profile" ? "clicked" : ""
            }`}
            onClick={() => {
              setActive("profile");
              setSidebar(false);
            }}
          >
            <AccountCircle className="dashboard-option-icon" /> Profile
          </p>

          <p
            className={`dashboard-option ${
              active === "active" ? "clicked" : ""
            }`}
            onClick={() => {
              setActive("active");
              setSidebar(false);
            }}
          >
            <LocalLibrary className="dashboard-option-icon" /> Issued
          </p>

          <p
            className={`dashboard-option ${
              active === "history" ? "clicked" : ""
            }`}
            onClick={() => {
              setActive("history");
              setSidebar(false);
            }}
          >
            <History className="dashboard-option-icon" /> History
          </p>

          <p
            className={`dashboard-option ${active === "fines" ? "clicked" : ""}`}
            onClick={() => {
              setActive("fines");
              setSidebar(false);
            }}
          >
            <Payment className="dashboard-option-icon" /> Fine Payment
          </p>

          {/* 🔹 New Library tab */}
          <p
            className={`dashboard-option ${
              active === "library" ? "clicked" : ""
            }`}
            onClick={() => {
              setActive("library");
              setSidebar(false);
            }}
          >
            <LibraryBooks className="dashboard-option-icon" /> Library
          </p>

          <p className="dashboard-option" onClick={logout}>
            <PowerSettingsNew className="dashboard-option-icon" /> Log out
          </p>
        </div>

        {/* Content */}
        <div className="dashboard-option-content">
          {/* Profile */}
          <div
            className="content-wrapper"
            style={active !== "profile" ? { display: "none" } : {}}
          >
            <div className="member-profile-content">
              <div className="user-details-topbar">
                <img
                  className="user-profileimage"
                  src="./assets/images/Profile.png"
                  alt="Profile"
                />
                <div className="user-info">
                  <div className="user-name-row">
                    <p className="user-name">
                      {memberDetails?.userFullName || "Loading..."}
                    </p>
                    {memberDetails && (
                      <span className="user-type-pill">
                        {memberDetails.userType}
                      </span>
                    )}
                  </div>
                  <p className="user-id">
                    {memberDetails
                      ? `${
                          memberDetails.userType === "Student"
                            ? "Admission ID"
                            : "Employee ID"
                        }: ${memberDetails.memberId}`
                      : ""}
                  </p>
                  <p className="user-email">{memberDetails?.email}</p>
                  <p className="user-phone">{memberDetails?.mobileNumber}</p>
                </div>
                <div className="profile-edit-actions">
                  <button
                    className="profile-edit-button"
                    type="button"
                    onClick={() => setIsEditingProfile((prev) => !prev)}
                  >
                    {isEditingProfile ? "Hide Edit" : "Edit Basic Info"}
                  </button>
                </div>
              </div>

              {/* Info grid */}
              <div className="profile-info-grid">
                <div className="profile-info-card">
                  <p className="profile-info-label">Gender</p>
                  <p className="profile-info-value">
                    {memberDetails?.gender || "-"}
                  </p>
                </div>
                <div className="profile-info-card">
                  <p className="profile-info-label">Department</p>
                  <p className="profile-info-value">
                    {memberDetails?.department || "-"}
                  </p>
                </div>
                <div className="profile-info-card">
                  <p className="profile-info-label">Address</p>
                  <p className="profile-info-value">
                    {memberDetails?.address || "-"}
                  </p>
                </div>
                <div className="profile-info-card">
                  <p className="profile-info-label">Member Since</p>
                  <p className="profile-info-value">
                    {memberDetails?.createdAt
                      ? formatDate(memberDetails.createdAt)
                      : "-"}
                  </p>
                </div>
              </div>

              {isEditingProfile && (
                <form className="profile-edit-form" onSubmit={saveProfile}>
                  <div className="profile-edit-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="userFullName"
                      value={profileForm.userFullName}
                      onChange={handleProfileInput}
                      required
                    />
                  </div>
                  <div className="profile-edit-field">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileInput}
                      required
                    />
                  </div>
                  <div className="profile-edit-field">
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={profileForm.mobileNumber}
                      onChange={handleProfileInput}
                      required
                    />
                  </div>
                  <div className="profile-edit-field">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={profileForm.gender}
                      onChange={handleProfileInput}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="profile-edit-field">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={profileForm.department}
                      onChange={handleProfileInput}
                    />
                  </div>
                  <div className="profile-edit-field">
                    <label>Date of Birth</label>
                    <input
                      type="text"
                      name="dob"
                      value={profileForm.dob}
                      onChange={handleProfileInput}
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                  <div className="profile-edit-field">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={profileForm.address}
                      onChange={handleProfileInput}
                      rows="3"
                    />
                  </div>
                  <div className="profile-edit-submit-row">
                    <button
                      className="profile-edit-button secondary"
                      type="button"
                      onClick={cancelProfileEdit}
                    >
                      Cancel
                    </button>
                    <button className="profile-edit-button" disabled={isSavingProfile}>
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Issued Books */}
          <div
            className="content-wrapper"
            style={active !== "active" ? { display: "none" } : {}}
          >
            <div className="member-activebooks-content">
              <p className="member-dashboard-heading">Issued Books</p>
              <table className="activebooks-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Book Name</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Fine (BDT)</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {memberDetails?.activeTransactions
                    ?.filter((t) => t.transactionType === "Issued")
                    .map((t, i) => {
                      const fineDue = getFineAmount(t);
                      const rawFine = getRawFineAmount(t);

                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{t.bookName}</td>
                          <td>{formatDate(t.fromDate)}</td>
                          <td>{formatDate(t.toDate)}</td>
                          <td>{rawFine}</td>
                          <td>
                            {t.finePaid ? (
                              <span className="fine-status paid">Paid</span>
                            ) : fineDue > 0 ? (
                              <span className="fine-status due">Due</span>
                            ) : (
                              <span className="fine-status clear">Clear</span>
                            )}
                          </td>
                          <td>
                            {fineDue > 0 && !t.finePaid && (
                              <button
                                className="fine-pay-button"
                                onClick={() => openFinePayment(t)}
                              >
                                Pay Fine
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* History */}
          <div
            className="content-wrapper"
            style={active !== "history" ? { display: "none" } : {}}
          >
            <div className="member-history-content">
              <p className="member-dashboard-heading">Borrowing History</p>
              <table className="activebooks-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Book Name</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Returned</th>
                    <th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {memberDetails?.prevTransactions
                    ?.filter((t) => t.transactionType === "Issued")
                    .map((t, i) => {
                    const rawFine = getRawFineAmount(t);

                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{t.bookName}</td>
                        <td>{formatDate(t.fromDate)}</td>
                        <td>{formatDate(t.toDate)}</td>
                        <td>{formatDate(t.returnDate)}</td>
                        <td>
                          {rawFine > 0 ? (
                            t.finePaid ? (
                              <span className="fine-status paid">
                                Paid {t.fineAmountPaid || rawFine} BDT
                              </span>
                            ) : (
                              <button
                                className="fine-pay-button"
                                onClick={() => openFinePayment(t)}
                              >
                                Pay {rawFine} BDT
                              </button>
                            )
                          ) : (
                            <span className="fine-status clear">Clear</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fine Payment */}
          <div
            className="content-wrapper"
            style={active !== "fines" ? { display: "none" } : {}}
          >
            <div className="member-fine-content">
              <div className="fine-header">
                <div>
                  <p className="member-dashboard-heading">Fine Payment</p>
                  <p className="fine-subtitle">
                    Demo payments clear overdue fines in this library account.
                  </p>
                </div>
              </div>

              <div className="fine-summary-grid">
                <div className="fine-summary-card due">
                  <span>Total Due</span>
                  <strong>{totalDue} BDT</strong>
                </div>
                <div className="fine-summary-card paid">
                  <span>Total Paid</span>
                  <strong>{totalPaid} BDT</strong>
                </div>
                <div className="fine-summary-card">
                  <span>Unpaid Items</span>
                  <strong>{unpaidFineTransactions.length}</strong>
                </div>
              </div>

              <table className="activebooks-table fine-table">
                <thead>
                  <tr>
                    <th>Book Name</th>
                    <th>Due Date</th>
                    <th>Days Late</th>
                    <th>Fine</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fineTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="fine-empty-row">
                        No fines found.
                      </td>
                    </tr>
                  ) : (
                    fineTransactions.map((transaction) => {
                      const fine = getFineAmount(transaction);
                      const rawFine = getRawFineAmount(transaction);

                      return (
                        <tr key={transaction._id}>
                          <td>{transaction.bookName}</td>
                          <td>{formatDate(transaction.toDate)}</td>
                          <td>{getDaysLate(transaction)}</td>
                          <td>{rawFine} BDT</td>
                          <td>
                            {transaction.finePaid ? (
                              <span className="fine-status paid">
                                Paid {transaction.fineAmountPaid || rawFine} BDT via{" "}
                                {transaction.finePaymentMethod}
                              </span>
                            ) : (
                              <span className="fine-status due">Due</span>
                            )}
                          </td>
                          <td>
                            {fine > 0 && !transaction.finePaid && (
                              <button
                                className="fine-pay-button"
                                onClick={() => openFinePayment(transaction)}
                              >
                                Pay Now
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🔹 Library */}
          <div
            className="content-wrapper"
            style={active !== "library" ? { display: "none" } : {}}
          >
            <div className="member-activebooks-content">
              <p className="member-dashboard-heading">Book Library</p>
              <div className="dashboard-title-line"></div>

              <BookLibrary />
            </div>
          </div>

          {selectedFine && (
            <div className="fine-payment-overlay" role="dialog" aria-modal="true">
              <form className="fine-payment-modal" onSubmit={payFine}>
                <div className="fine-payment-header">
                  <div>
                    <h3>Demo Fine Payment</h3>
                    <p>{selectedFine.bookName}</p>
                  </div>
                  <button type="button" onClick={closeFinePayment}>
                    Close
                  </button>
                </div>

                <div className="fine-payment-amount">
                  <span>Amount to pay</span>
                  <strong>{getFineAmount(selectedFine)} BDT</strong>
                </div>

                <label>
                  Payment Method
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="bKash">bKash</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Regular Banking">Regular Banking</option>
                  </select>
                </label>

                <label>
                  Demo Reference
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Transaction ID / account note"
                  />
                </label>

                <button className="fine-payment-submit" disabled={isPayingFine}>
                  {isPayingFine ? "Processing..." : "Complete Demo Payment"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
