import React, { useContext, useEffect, useState } from "react";
import "../AdminDashboard/AdminDashboard.css"; // Reuses shared styles
import "./MemberDashboard.css";
import {
  LibraryBooks,
  AccountCircle,
  Book,
  History,
  LocalLibrary,
  PowerSettingsNew,
  Close,
  DoubleArrow,
} from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import { AuthContext } from "../../../Context/AuthContext";
import axios from "axios";
import moment from "moment";

function MemberDashboard() {
  const [active, setActive] = useState("profile");
  const [sidebar, setSidebar] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const [memberDetails, setMemberDetails] = useState(null);

  // 🔁 Common date formatter (handles old + new formats)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return moment(dateStr, ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]).format(
      "DD-MM-YYYY"
    );
  };

  useEffect(() => {
    const getMemberDetails = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/users/getuser/${user._id}`
        );
        setMemberDetails(response.data);
      } catch (err) {
        console.log("Error fetching member details", err);
      }
    };
    if (user?._id) {
      getMemberDetails();
    }
  }, [API_URL, user]);

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
              active === "reserved" ? "clicked" : ""
            }`}
            onClick={() => {
              setActive("reserved");
              setSidebar(false);
            }}
          >
            <Book className="dashboard-option-icon" /> Reserved
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
                  <p className="user-name">
                    {memberDetails?.userFullName || "Loading..."}
                  </p>
                  <p className="user-id">
                    {memberDetails
                      ? `${
                          memberDetails.userType === "Student"
                            ? "Admission ID: "
                            : "Employee ID: "
                        }${memberDetails.memberId}`
                      : ""}
                  </p>
                  <p className="user-email">{memberDetails?.email}</p>
                  <p className="user-phone">{memberDetails?.mobileNumber}</p>
                </div>
              </div>

              <div className="user-details-specific">
                <div className="specific-left">
                  <div className="specific-left-top">
                    <div className="specific-left-topic">
                      <span>
                        <b>Age</b>
                      </span>
                      <span>{memberDetails?.age}</span>
                    </div>
                    <div className="specific-left-topic">
                      <span>
                        <b>Gender</b>
                      </span>
                      <span>{memberDetails?.gender}</span>
                    </div>
                  </div>
                  <div className="specific-left-bottom">
                    <div className="specific-left-topic">
                      <span>
                        <b>DOB</b>
                      </span>
                      <span>{formatDate(memberDetails?.dob)}</span>
                    </div>
                    <div className="specific-left-topic">
                      <span>
                        <b>Address</b>
                      </span>
                      <span>{memberDetails?.address}</span>
                    </div>
                  </div>
                </div>

                <div className="specific-right">
                  <div className="specific-right-top">
                    <p className="specific-right-topic">
                      <b>Points</b>
                    </p>
                    <p className="points-value">540</p>
                  </div>
                  <div className="dashboard-title-line"></div>
                  <div className="specific-right-bottom">
                    <p className="specific-right-topic">
                      <b>Rank</b>
                    </p>
                    <p className="points-value">
                      {memberDetails?.points || 0}
                    </p>
                  </div>
                </div>
              </div>
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
                  </tr>
                </thead>
                <tbody>
                  {memberDetails?.activeTransactions
                    ?.filter((t) => t.transactionType === "Issued")
                    .map((t, i) => {
                      const toMoment = moment(
                        t.toDate,
                        ["DD-MM-YYYY", "MM/DD/YYYY", moment.ISO_8601]
                      ).startOf("day");
                      const today = moment().startOf("day");
                      const daysLate = today.diff(toMoment, "days");
                      const fine = daysLate > 0 ? daysLate * 10 : 0;

                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{t.bookName}</td>
                          <td>{formatDate(t.fromDate)}</td>
                          <td>{formatDate(t.toDate)}</td>
                          <td>{fine}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reserved Books */}
          <div
            className="content-wrapper"
            style={active !== "reserved" ? { display: "none" } : {}}
          >
            <div className="member-reservedbooks-content">
              <p className="member-dashboard-heading">Reserved Books</p>
              <table className="activebooks-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Book Name</th>
                    <th>From</th>
                    <th>To</th>
                  </tr>
                </thead>
                <tbody>
                  {memberDetails?.activeTransactions
                    ?.filter((t) => t.transactionType === "Reserved")
                    .map((t, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{t.bookName}</td>
                        <td>{formatDate(t.fromDate)}</td>
                        <td>{formatDate(t.toDate)}</td>
                      </tr>
                    ))}
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
                  </tr>
                </thead>
                <tbody>
                  {memberDetails?.prevTransactions?.map((t, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{t.bookName}</td>
                      <td>{formatDate(t.fromDate)}</td>
                      <td>{formatDate(t.toDate)}</td>
                      <td>{formatDate(t.returnDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
