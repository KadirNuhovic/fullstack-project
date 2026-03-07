import React, { useState } from 'react';
import { FiFacebook, FiInstagram, FiTwitter, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import './Footer.css';

function Footer({ setActivePage, setSelectedProduct, setSearchTerm, t, API_URL }) {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setNewsletterStatus({ type: 'sending' });

    try {
      const response = await fetch(`${API_URL}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewsletterStatus({ type: 'success', message: 'Hvala na prijavi!' });
        setEmail('');
        setTimeout(() => setNewsletterStatus(null), 3000);
      } else {
        setNewsletterStatus({ type: 'error', message: data.message || 'Došlo je do greške.' });
      }
    } catch (error) {
      setNewsletterStatus({ type: 'error', message: 'Greška u povezivanju sa serverom.' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about-us">
          <h2 className="footer-logo">Suvo Voće</h2>
          <p className="footer-text">{t.footer.text}</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FiFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FiInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FiTwitter /></a>
          </div>
        </div>
        
        <div className="footer-section links">
          <h3>{t.footer.quickLinks}</h3>
          <ul className="footer-links">
            <li><button className="footer-link-btn" onClick={() => { setActivePage('home'); setSearchTerm(''); }}>{t.header.home}</button></li>
            <li><button className="footer-link-btn" onClick={() => { setActivePage('products'); setSelectedProduct(null); setSearchTerm(''); }}>{t.header.products}</button></li>
            <li><button className="footer-link-btn" onClick={() => { setActivePage('about'); setSearchTerm(''); }}>{t.header.about}</button></li>
            <li><button className="footer-link-btn" onClick={() => { setActivePage('contact'); setSearchTerm(''); }}>{t.header.contact}</button></li>
          </ul>
        </div>

        <div className="footer-section contact-info">
          <h3>Kontakt</h3>
          <ul className="footer-links contact-details">
            <li><FiMapPin /> <span>Bulevar Zdravlja 123, Beograd</span></li>
            <li><FiPhone /> <span>+381 60 123 4567</span></li>
            <li><FiMail /> <span>info@benko.rs</span></li>
          </ul>
        </div>

        <div className="footer-section newsletter">
          <h3>{t.newsletter.title}</h3>
          <p>{t.newsletter.text}</p>
          <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input type="email" placeholder={t.newsletter.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={newsletterStatus?.type === 'sending'}>
              {newsletterStatus?.type === 'sending' ? '...' : '→'}
            </button>
          </form>
          {newsletterStatus && <p className={`newsletter-status ${newsletterStatus.type}`}>{newsletterStatus.message}</p>}
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Suvo Voće. {t.footer.rights}</p>
      </div>
    </footer>
  );
}

export default Footer;