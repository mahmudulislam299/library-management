import React, { useState } from "react";
import "./AdminDashboard.css";
import AddTransaction from "./Components/AddTransaction";
import AddMember from "./Components/AddMember";
import AddBook from "./Components/AddBook";
import GetMember from "./Components/GetMember";
import Return from "./Components/Return";
import AdminProfile from "./Components/AdminProfile";

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

// Semantic UI CSS
const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href =
  "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
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
        {/* Toggler */}
        <div className="sidebar-toggler" onClick={() => setSidebar(!sidebar)}>
          <IconButton>
            {sidebar ? <Close /> : <DoubleArrow />}
          </IconButton>
        </div>

        {/* Sidebar */}
        <div className={`dashboard-options ${sidebar ? "active" : ""}`}>
          <div className="dashboard-logo">
            <LibraryBooks />
            <p className="logo-name">LCMS</p>
          </div>

          {[
            { id: "profile", icon: AccountCircle, label: "Profile" },
            { id: "addbook", icon: Book, label: "Add Book" },
            { id: "addtransaction", icon: Receipt, label: "Add Transaction" },
            { id: "getmember", icon: AccountBox, label: "Get Member" },
            { id: "addmember", icon: PersonAdd, label: "Add Member" },
            { id: "returntransaction", icon: AssignmentReturn, label: "Return" },
          ].map(({ id, icon: Icon, label }) => (
            <p
              key={id}
              className={`dashboard-option ${
                active === id ? "clicked" : ""
              }`}
              onClick={() => {
                setActive(id);
                setSidebar(false);
              }}
            >
              <Icon className="dashboard-option-icon" /> {label}
            </p>
          ))}

          <p className="dashboard-option" onClick={logout}>
            <PowerSettingsNew className="dashboard-option-icon" /> Log out
          </p>
        </div>

        {/* Content */}
        <div className="dashboard-option-content">
          <div
            className="content-wrapper"
            style={{ display: active === "profile" ? "block" : "none" }}
          >
            <AdminProfile />
          </div>

          <div
            className="content-wrapper"
            style={{ display: active === "addbook" ? "block" : "none" }}
          >
            <AddBook />
          </div>

          <div
            className="content-wrapper"
            style={{ display: active === "addtransaction" ? "block" : "none" }}
          >
            <AddTransaction />
          </div>

          <div
            className="content-wrapper"
            style={{ display: active === "addmember" ? "block" : "none" }}
          >
            <AddMember />
          </div>

          <div
            className="content-wrapper"
            style={{ display: active === "getmember" ? "block" : "none" }}
          >
            <GetMember />
          </div>

          <div
            className="content-wrapper"
            style={{ display: active === "returntransaction" ? "block" : "none" }}
          >
            <Return />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
