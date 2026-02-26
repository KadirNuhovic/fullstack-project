import React from 'react';
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import './Footer.css';

function Footer({ setActivePage, setSelectedProduct, setSearchTerm, t }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h2 className="footer-logo">Suvo Voće</h2>
          <p className="footer-text">
            {t.footer.text}
          </p>
        </div>
        
        <div className="footer-section">
          <h3>{t.footer.quickLinks}</h3>
          <ul className="footer-links">
            <li><button className="footer-link-btn" onClick={() => { setActivePage('home'); setSearchTerm(''); }}>{t.header.home}</button></li>
            <li><button className="footer-link-btn" onClick={() => { setActivePage('products'); setSelectedProduct(null); setSearchTerm(''); }}>{t.header.products}</button></li>
            <li><button className="footer-link-btn" onClick={() => { setActivePage('about'); setSearchTerm(''); }}>{t.header.about}</button></li>
            <li><button className="footer-link-btn" onClick={() => { setActivePage('contact'); setSearchTerm(''); }}>{t.header.contact}</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>{t.footer.followUs}</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FiFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FiInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FiTwitter /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; 2026 Suvo Voće. {t.footer.rights}
          <span onClick={() => setActivePage('subscribers')} style={{cursor: 'pointer', opacity: 0.3, marginLeft: '10px'}}>•</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;