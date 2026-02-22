import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import HeroSection from './HeroSection';
import InfoSection from './InfoSection';
import NewsletterSection from './NewsletterSection';
import CartSidebar from './CartSidebar';
import AuthModal from './AuthModal';
import ProductDetail from './ProductDetail';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  // Stanja za podatke sa backenda
  const [products, setProducts] = useState([]); // Svi proizvodi
  const [cart, setCart] = useState([]); // Stavke u korpi
  const [serverError, setServerError] = useState(null); // Greška pri povezivanju
  const [activePage, setActivePage] = useState('home'); // 'home' ili 'products'

  const [searchTerm, setSearchTerm] = useState('');
  const [rezultati, setRezultati] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false); // Da li je prozor otvoren?
  const [currentUser, setCurrentUser] = useState(null); // Ko je trenutno ulogovan?
  const [authMode, setAuthMode] = useState('signin'); // 'signin' ili 'signup'
  const [isCartOpen, setIsCartOpen] = useState(false); // Da li je korpa otvorena?
  
  // Stanja za detalje proizvoda
  const [selectedProduct, setSelectedProduct] = useState(null); // Koji proizvod gledamo?

  // Učitavanje podataka sa backenda pri prvom renderovanju
  useEffect(() => {
    const fetchData = async () => {
      try {
        setServerError(null);
        // Učitaj proizvode
        const productsRes = await fetch(`${API_URL}/products`);
        const productsData = await productsRes.json();
        setProducts(productsData);
        setRezultati(productsData); // Inicijalno prikaži sve

        // Učitaj korpu
        const cartRes = await fetch(`${API_URL}/cart`);
        const cartData = await cartRes.json();
        setCart(cartData);
      } catch (error) {
        console.error("Greška pri učitavanju podataka:", error);
        setServerError("Nije moguće povezati se sa serverom. Proveri da li je 'node server.js' pokrenut.");
      }
    };

    fetchData();
  }, []);

  // Ovaj useEffect se pokreće svaki put kad se `searchTerm` promeni
  useEffect(() => {
    if (searchTerm === '') {
      setRezultati(products); // Ako je pretraga prazna, prikaži sve
    } else {
      setActivePage('products'); // Automatski prebaci na proizvode kad neko kuca pretragu
      // Filtriraj artikle na osnovu unosa
      const filtrirani = products.filter(proizvod =>
        proizvod.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setRezultati(filtrirani);
    }
  }, [searchTerm, products]);

  // Funkcije za Modal
  const handleSignIn = () => {
    setShowAuthModal(true);
    setAuthMode('signin');
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsCartOpen(false);
  };

  // --- FUNKCIJE ZA KORPU ---
  const handleAddToCart = async (productId, quantity) => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data.korpa); // Ažuriraj stanje korpe na frontendu
      } else {
        console.error("Greška pri dodavanju u korpu:", data.message);
      }
    } catch (error) {
      console.error("Greška na serveru:", error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data.korpa); // Ažuriraj stanje korpe
      } else {
        console.error("Greška pri brisanju iz korpe:", data.message);
      }
    } catch (error) {
      console.error("Greška na serveru:", error);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- FUNKCIJE ZA DETALJE PROIZVODA ---
  const openProductDetail = (proizvod) => {
    setSelectedProduct(proizvod);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  // --- Glavni sajt se sada uvek prikazuje ---
  return (
    <div className="App">
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        currentUser={currentUser} 
        handleLogout={handleLogout} 
        handleSignIn={handleSignIn} 
        setIsCartOpen={setIsCartOpen} 
        cartItemCount={cartItemCount}
        setSelectedProduct={setSelectedProduct}
      />

      <main className="content-area">
        {activePage === 'home' ? (
          // --- POČETNA STRANICA (HERO SEKCIJA) ---
          <>
            <HeroSection setActivePage={setActivePage} />
            <InfoSection />
            <NewsletterSection />
          </>
        ) : (
          selectedProduct ? (
          // --- PRIKAZ DETALJA PROIZVODA ---
          <ProductDetail 
            product={selectedProduct} 
            onClose={closeProductDetail} 
            onAddToCart={handleAddToCart} 
          />
        ) : (
          // --- PRIKAZ LISTE PROIZVODA (GRID) ---
          <>
            {serverError && (
              <div className="server-error-message">
                <h3>⚠️ Greška u povezivanju</h3>
                <p>{serverError}</p>
              </div>
            )}

            <h2 className="section-title">Naša Ponuda ({rezultati.length})</h2>
            {rezultati.length > 0 ? (
              <div className="product-grid">
                {rezultati.map((proizvod) => (
                  <div key={proizvod.id} className="product-card" onClick={() => openProductDetail(proizvod)}>
                    <div className="product-image-wrapper">
                      <img src={proizvod.image} alt={proizvod.name} className="product-image" />
                    </div>
                    <div className="product-info">
                      <h3>{proizvod.name}</h3>
                      <span className="product-price">{proizvod.price} RSD</span>
                      <button className="btn-add-cart" onClick={(e) => { e.stopPropagation(); handleAddToCart(proizvod.id, 1); }}>
                        Dodaj u korpu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-results">Nema rezultata za "{searchTerm}"</p>
            )}
          </>
        ))}
      </main>

      {/* --- FOOTER --- */}
      <Footer setActivePage={setActivePage} setSelectedProduct={setSelectedProduct} />

      {/* --- MODAL ZA PRIJAVU / REGISTRACIJU --- */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeModal} 
        API_URL={API_URL} 
        setCurrentUser={setCurrentUser} 
        initialMode={authMode}
      />

      {/* --- MODAL/SIDEBAR ZA KORPU --- */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onRemove={handleRemoveFromCart} 
      />
    </div>
  );
}

export default App;
