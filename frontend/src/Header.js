import React from 'react';
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
  setIsCartOpen, 
  cartItemCount,
  setSelectedProduct
}) {
  return (
    <header className="header">
      <div className="logo" onClick={() => setActivePage('home')}>Suvo Voće</div>

      <nav className="navigation">
        <a href="#" className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage('home'); }}>Početna</a>
        <a href="#" className={`nav-link ${activePage === 'products' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage('products'); setSelectedProduct(null); }}>Proizvodi</a>
        <a href="#" className="nav-link">O Nama</a>
        <a href="#" className="nav-link">Kontakt</a>
      </nav>

      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Pretraži voće..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="auth-buttons">
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', color: '#61dafb' }}>{currentUser}</span>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '5px 10px' }}>Odjavi se</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleSignIn}>Prijavi se</button>
        )}
        <button className="btn btn-icon" onClick={() => setIsCartOpen(true)}>
          <FiShoppingCart size={24} />
          {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
        </button>
      </div>
    </header>
  );
}

export default Header;