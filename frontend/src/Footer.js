import React from 'react';
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import './Footer.css';

function Footer({ setActivePage, setSelectedProduct }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h2 className="footer-logo">Suvo Voće</h2>
          <p className="footer-text">
            Najbolje sušeno voće iz prirode, direktno do vas. Zdravlje i ukus u svakom zalogaju.
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Brzi Linkovi</h3>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('home'); }}>Početna</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('products'); setSelectedProduct(null); }}>Proizvodi</a></li>
            <li><a href="#">O Nama</a></li>
            <li><a href="#">Kontakt</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('admin'); }} style={{color: '#ff4757'}}>Admin Panel</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Pratite Nas</h3>
          <div className="social-icons">
            <a href="#" className="social-icon"><FiFacebook /></a>
            <a href="#" className="social-icon"><FiInstagram /></a>
            <a href="#" className="social-icon"><FiTwitter /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom"><p>&copy; 2026 Suvo Voće. Sva prava zadržana.</p></div>
    </footer>
  );
}

export default Footer;