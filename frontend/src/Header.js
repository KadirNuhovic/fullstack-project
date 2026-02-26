import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import './Header.css';

function Header({ 
  activePage, 
  setActivePage, 
  searchTerm, 
  setSearchTerm, 
  currentUser, 
  handleLogout, 
  handleSignIn, 
  cartItemCount,
  setSelectedProduct,
  language,
  setLanguage,
  t
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    // Ako korisnik počne da kuca, automatski ga prebaci na stranicu sa proizvodima
    if (newSearchTerm.trim() !== '' && activePage !== 'products') {
      setActivePage('products');
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <a href="/" className="logo" onClick={(e) => { e.preventDefault(); setActivePage('home'); setSearchTerm(''); closeMobileMenu(); }}>Suvo Voće</a>

        {/* Desktop Navigacija */}
        <nav className={`navigation ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={() => { setActivePage('home'); setSearchTerm(''); closeMobileMenu(); }}>{t.header.home}</button>
          <button className={`nav-link ${activePage === 'products' ? 'active' : ''}`} onClick={() => { setActivePage('products'); setSelectedProduct(null); setSearchTerm(''); closeMobileMenu(); }}>{t.header.products}</button>
          <button className={`nav-link ${activePage === 'about' ? 'active' : ''}`} onClick={() => { setActivePage('about'); setSearchTerm(''); closeMobileMenu(); }}>{t.header.about}</button>
          <button className={`nav-link ${activePage === 'contact' ? 'active' : ''}`} onClick={() => { setActivePage('contact'); setSearchTerm(''); closeMobileMenu(); }}>{t.header.contact}</button>
          {/* Dodatna dugmad za mobilni meni mogu ići ovde ako želiš */}
        </nav>

        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder={t.header.searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="auth-buttons">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#61dafb' }}>{currentUser}</span>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '5px 10px' }}>{t.header.logout}</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleSignIn}>{t.header.login}</button>
          )}
          
          <select className="lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="sr-lat">SR (Lat)</option>
            <option value="sr-cyr">СР (Ћир)</option>
            <option value="en">EN</option>
            <option value="hr">HR</option>
          </select>

          <button className="btn btn-icon" onClick={() => setActivePage('cart')}>
            <FiShoppingCart size={24} />
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </button>

          {/* Hamburger Dugme */}
          <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header; 