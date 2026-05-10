import React, { useState } from "react";
import "./AdminDashboard.css";
import AddTransaction from "./Components/AddTransaction";
import AddMember from "./Components/AddMember";
import AddBook from "./Components/AddBook";
import GetMember from "./Components/GetMember";
import Return from "./Components/Return";
import AdminProfile from "./Components/AdminProfile";
import FineManagement from "./Components/FineManagement";
import BookLibrary from "../SharedComponents/BookLibrary";

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
  Payment,
} from "@material-ui/icons";
import { IconButton } from "@material-ui/core";

// ✅ Semantic UI CSS
const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href =
  "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

function AdminDashboard() {
  const [active, setActive] = useState("library");
  const [sidebar, setSidebar] = useState(false);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  // 🧭 Sidebar menu items
  const menuItems = [
    { id: "profile", icon: AccountCircle, label: "Admin Account" },
    { id: "library", icon: LibraryBooks, label: "Library" }, // 🔹 New Tab
    { id: "addbook", icon: Book, label: "Book Registration" },
    { id: "addtransaction", icon: Receipt, label: "Issue / Reserve Book" },
    { id: "getmember", icon: AccountBox, label: "Member Full Info" },
    { id: "finemanagement", icon: Payment, label: "Fine Tracking" },
    { id: "addmember", icon: PersonAdd, label: "Member Registration" },
    { id: "returntransaction", icon: AssignmentReturn, label: "Return Desk" },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        {/* Sidebar Toggler */}
        <div className="sidebar-toggler" onClick={() => setSidebar(!sidebar)}>
          <IconButton>
            {sidebar ? <Close /> : <DoubleArrow />}
          </IconButton>
        </div>

        {/* Sidebar */}
        <div className={`dashboard-options ${sidebar ? "active" : ""}`}>
          <div className="dashboard-logo">
            <LibraryBooks />
            <p className="logo-name">LMS</p>
          </div>

          {menuItems.map(({ id, icon: Icon, label }) => (
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

        {/* Content Area */}
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

          <div
            className="content-wrapper"
            style={{ display: active === "finemanagement" ? "block" : "none" }}
          >
            <FineManagement />
          </div>

          {/* 🔹 Library Tab */}
          <div
            className="content-wrapper"
            style={{ display: active === "library" ? "block" : "none" }}
          >
            <BookLibrary />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
