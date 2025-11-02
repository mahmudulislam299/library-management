import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        <Link to="/" onClick={closeMenu}>
          Stamford Library
        </Link>
      </div>

      {/* Desktop Nav + Search */}
      <div className="nav-center">
        <input
          type="text"
          placeholder="Search books, authors..."
          className="search-input"
        />
        <nav className="nav-options">
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/books" className="nav-link" onClick={closeMenu}>
            Books
          </Link>
          <Link to="/signin" className="nav-link" onClick={closeMenu}>
            Sign In
          </Link>
        </nav>
      </div>

      {/* Mobile Menu Toggle */}
      <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/books" onClick={closeMenu}>Books</Link>
        <Link to="/signin" onClick={closeMenu}>Sign In</Link>
        <input
          type="text"
          placeholder="Search..."
          className="mobile-search"
        />
      </div>
    </header>
  );
}

export default Header;