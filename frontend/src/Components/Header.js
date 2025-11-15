import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import { AuthContext } from "../Context/AuthContext"; // ⬅️ adjust path if needed

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const getUserInitial = () => {
    if (!user) return "";
    if (user.userType === "Student") return "S";
    if (user.userType === "Employee") return "E";
    return "U";
  };

  const getIdLabel = () => {
    if (!user) return "";
    if (user.userType === "Student") return `Student ID: ${user.memberId}`;
    if (user.userType === "Employee") return `Employee ID: ${user.memberId}`;
    return `ID: ${user.memberId}`;
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        <Link to="/" onClick={closeMenu}>
          <img src="/logo1.png" alt="Library Logo" className="logo-img" />
          <span className="logo-text">Stamford Library</span>
        </Link>
      </div>

      {/* Desktop: Search + Nav */}
      <div className="nav-center">
        <input
          type="text"
          placeholder="Search books, authors..."
          className="search-input"
          aria-label="Search books"
        />
        <nav className="nav-options" aria-label="Main navigation">
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/books" className="nav-link" onClick={closeMenu}>
            Books
          </Link>
          <Link to="/signin" className="nav-link" onClick={closeMenu}>
            Browse Library
          </Link>
        </nav>
      </div>

      {/* User Info (Right Corner) */}
      {user ? (
        <div className="user-box">
          <div className="user-avatar">{getUserInitial()}</div>
          <div className="user-meta">
            <span className="user-name">{user.name}</span>
            <span className="user-id">{getIdLabel()}</span>
          </div>
        </div>
      ) : (
        <Link to="/signin" className="nav-link nav-login nav-login-right">
          Sign In
        </Link>
      )}

      {/* Mobile Toggle */}
      <button
        className="mobile-toggle"
        onClick={toggleMenu}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>
        <Link to="/books" onClick={closeMenu}>
          Books
        </Link>
        <Link to="/signin" onClick={closeMenu}>
          Sign In
        </Link>

        {/* Optional: user info inside mobile menu */}
        {user && (
          <div className="mobile-user-box">
            <div className="mobile-user-avatar">{getUserInitial()}</div>
            <div className="mobile-user-meta">
              <span className="mobile-user-name">{user.name}</span>
              <span className="mobile-user-id">{getIdLabel()}</span>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Search..."
          className="mobile-search"
          aria-label="Mobile search"
        />
      </div>
    </header>
  );
}

export default Header;
