import React, { useState, useEffect } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
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

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo" onClick={() => { setActivePage('home'); setSearchTerm(''); }}>Suvo Voće</div>

        <nav className="navigation">
          <a href="#" className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage('home'); setSearchTerm(''); }}>{t.header.home}</a>
          <a href="#" className={`nav-link ${activePage === 'products' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage('products'); setSelectedProduct(null); setSearchTerm(''); }}>{t.header.products}</a>
          <a href="#" className={`nav-link ${activePage === 'about' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage('about'); setSearchTerm(''); }}>{t.header.about}</a>
          <a href="#" className={`nav-link ${activePage === 'contact' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage('contact'); setSearchTerm(''); }}>{t.header.contact}</a>
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
        </div>
      </div>
    </header>
  );
}

export default Header; 