import React, { useState } from "react";
import "./AdminDashboard.css";
import AddTransaction from "./Components/AddTransaction";
import AddMember from "./Components/AddMember";
import AddBook from "./Components/AddBook";
import GetMember from "./Components/GetMember";
import Return from "./Components/Return";

import {
  LibraryBooks,
  AccountCircle,
  Book,
  Receipt,
  PersonAdd,
  DoubleArrow,
  Close,
  AccountBox,
  AssignmentReturn,
  PowerSettingsNew,
} from "@material-ui/icons";
import { IconButton } from "@material-ui/core";

/* Semantic UI Dropdown */
const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

function AdminDashboard() {
  const [active, setActive] = useState("addbook");
  const [sidebar, setSidebar] = useState(false);

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
            className={`dashboard-option ${active === "profile" ? "clicked" : ""}`}
            onClick={() => { setActive("profile"); setSidebar(false); }}
          >
            <AccountCircle className="dashboard-option-icon" /> Profile
          </p>

          <p
            className={`dashboard-option ${active === "addbook" ? "clicked" : ""}`}
            onClick={() => { setActive("addbook"); setSidebar(false); }}
          >
            <Book className="dashboard-option-icon" /> Add Book
          </p>

          <p
            className={`dashboard-option ${active === "addtransaction" ? "clicked" : ""}`}
            onClick={() => { setActive("addtransaction"); setSidebar(false); }}
          >
            <Receipt className="dashboard-option-icon" /> Add Transaction
          </p>

          <p
            className={`dashboard-option ${active === "getmember" ? "clicked" : ""}`}
            onClick={() => { setActive("getmember"); setSidebar(false); }}
          >
            <AccountBox className="dashboard-option-icon" /> Get Member
          </p>

          <p
            className={`dashboard-option ${active === "addmember" ? "clicked" : ""}`}
            onClick={() => { setActive("addmember"); setSidebar(false); }}
          >
            <PersonAdd className="dashboard-option-icon" /> Add Member
          </p>

          <p
            className={`dashboard-option ${active === "returntransaction" ? "clicked" : ""}`}
            onClick={() => { setActive("returntransaction"); setSidebar(false); }}
          >
            <AssignmentReturn className="dashboard-option-icon" /> Return
          </p>

          <p className="dashboard-option" onClick={logout}>
            <PowerSettingsNew className="dashboard-option-icon" /> Log out
          </p>
        </div>

        {/* Content Area */}
        <div className="dashboard-option-content">
          <div className="content-wrapper" style={active !== "addbook" ? { display: "none" } : {}}>
            <AddBook />
          </div>
          <div className="content-wrapper" style={active !== "addtransaction" ? { display: "none" } : {}}>
            <AddTransaction />
          </div>
          <div className="content-wrapper" style={active !== "addmember" ? { display: "none" } : {}}>
            <AddMember />
          </div>
          <div className="content-wrapper" style={active !== "getmember" ? { display: "none" } : {}}>
            <GetMember />
          </div>
          <div className="content-wrapper" style={active !== "returntransaction" ? { display: "none" } : {}}>
            <Return />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;