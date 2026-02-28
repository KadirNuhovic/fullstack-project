import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
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
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const languages = {
    'sr-lat': { flag: '🇷🇸', label: 'SR' },
    'sr-cyr': { flag: '🇷🇸', label: 'СР' },
    'en': { flag: '🇬🇧', label: 'EN' },
    'hr': { flag: '🇭🇷', label: 'HR' }
  };

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
          {/* Custom Language Selector */}
          <div className="lang-dropdown">
            <button 
              className="lang-btn" 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              title="Promeni jezik"
            >
              <span className="lang-flag">{languages[language].flag}</span>
              <span className="lang-text">{languages[language].label}</span>
            </button>
            
            {isLangMenuOpen && (
              <div className="lang-menu">
                {Object.entries(languages).map(([key, val]) => (
                  <button key={key} className={`lang-item ${language === key ? 'active' : ''}`} onClick={() => { setLanguage(key); setIsLangMenuOpen(false); }}>
                    <span className="lang-flag">{val.flag}</span>
                    <span className="lang-text">{val.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {currentUser ? (
            <>
              <button className="btn btn-icon" onClick={() => setActivePage('profile')} title="Moj Profil">
                <FiUser size={24} style={{color: '#61dafb'}} />
              </button>
              <button className="btn btn-icon" onClick={handleLogout} title={t.header.logout}>
                <FiLogOut size={24} />
              </button>
            </>
          ) : (
            <button className="btn btn-icon" onClick={handleSignIn} title={t.header.login}>
              <FiUser size={24} />
            </button>
          )}

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