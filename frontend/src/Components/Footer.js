import React from "react";
import "./Footer.css";
import TwitterIcon from "@material-ui/icons/Twitter";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import TelegramIcon from "@material-ui/icons/Telegram";
import InstagramIcon from "@material-ui/icons/Instagram";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-columns">
          {/* Contact Details */}
          <div className="footer-col">
            <h3 className="footer-heading">Contact Us</h3>
            <p>Librarian</p>
            <p>Stamford University</p>
            <p>Dhaka</p>
            <p>Bangladesh</p>
            <p>
              <strong>Email:</strong> example@gmail.com
            </p>
          </div>

          {/* Useful Links */}
          <div className="footer-col">
            <h3 className="footer-heading">Useful Links</h3>
            <a href="#home">Home</a>
            <a href="#books">Browse Books</a>
            <a href="#about">About Library</a>
            <a href="#contact">Contact</a>
          </div>

          {/* Librarian Info */}
          <div className="footer-col">
            <h3 className="footer-heading">Librarian</h3>
            <p>Dr. Ayesha Rahman</p>
            <p>Ph.D. in Library Science</p>
            <p>
              <strong>Contact:</strong> +880 17 1234 5678
            </p>
          </div>
        </div>

        {/* Social Icons */}
        <div className="footer-social">
          <a href="#twitter" className="social-link" aria-label="Twitter">
            <TwitterIcon />
          </a>
          <a href="#linkedin" className="social-link" aria-label="LinkedIn">
            <LinkedInIcon />
          </a>
          <a href="#telegram" className="social-link" aria-label="Telegram">
            <TelegramIcon />
          </a>
          <a href="#instagram" className="social-link" aria-label="Instagram">
            <InstagramIcon />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2025 Stamford Library. All rights reserved.
        </p>
        <p className="footer-credit">
          Designed with love by <strong>Mahmudul Islam</strong>
        </p>
      </div>
    </footer>
  );
}

export default Footer;