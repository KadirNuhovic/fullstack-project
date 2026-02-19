import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiArrowLeft, FiStar, FiPlus, FiMinus, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi'; // Nove ikonice
import './App.css';

// Podaci koje ćemo pretraživati (ovo bi inače dolazilo sa backenda)
const SVI_PROIZVODI = [
  { id: 1, naziv: 'Suve Šljive', cena: '550 RSD/kg', slika: 'https://images.unsplash.com/photo-1595416686568-7965353c2529?auto=format&fit=crop&w=500&q=60' },
  { id: 2, naziv: 'Suve Smokve', cena: '800 RSD/kg', slika: 'https://images.unsplash.com/photo-1606824960879-592d77977462?auto=format&fit=crop&w=500&q=60' },
  { id: 3, naziv: 'Urme', cena: '720 RSD/kg', slika: 'https://images.unsplash.com/photo-1543158266-0066955047b1?auto=format&fit=crop&w=500&q=60' },
  { id: 4, naziv: 'Suvo Grožđe', cena: '480 RSD/kg', slika: 'https://images.unsplash.com/photo-1585671720293-c41f74b48621?auto=format&fit=crop&w=500&q=60' },
  { id: 5, naziv: 'Suve Kajsije', cena: '950 RSD/kg', slika: 'https://images.unsplash.com/photo-1596568673737-272971987570?auto=format&fit=crop&w=500&q=60' },
  { id: 6, naziv: 'Ukrasne Kriške Narandže', cena: '1200 RSD/kg', slika: 'https://images.unsplash.com/photo-1611244419377-b0a760c19719?auto=format&fit=crop&w=500&q=60' },
  { id: 7, naziv: 'Brusnica', cena: '1100 RSD/kg', slika: 'https://images.unsplash.com/photo-1605557626697-2e87166d88f9?auto=format&fit=crop&w=500&q=60' },
  { id: 8, naziv: 'Suvi Ananas', cena: '1300 RSD/kg', slika: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=500&q=60' },
  { id: 9, naziv: 'Suvi Mango', cena: '1450 RSD/kg', slika: 'https://images.unsplash.com/photo-1621449991382-7d053ee269c6?auto=format&fit=crop&w=500&q=60' },
  { id: 10, naziv: 'Suva Papaja', cena: '1400 RSD/kg', slika: 'https://images.unsplash.com/photo-1617117833203-c91b0602270e?auto=format&fit=crop&w=500&q=60' },
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rezultati, setRezultati] = useState(SVI_PROIZVODI);
  const [showAuthModal, setShowAuthModal] = useState(false); // Da li je prozor otvoren?
  const [authMode, setAuthMode] = useState('signin'); // 'signin' ili 'signup'
  
  // Stanja za detalje proizvoda
  const [selectedProduct, setSelectedProduct] = useState(null); // Koji proizvod gledamo?
  const [quantity, setQuantity] = useState(1); // Količina
  const [reviews, setReviews] = useState([]); // Komentari
  const [newReview, setNewReview] = useState(''); // Novi komentar tekst
  
  // Stanja za input polja u formi
  const [authMessage, setAuthMessage] = useState(''); // Poruke za greške ili uspeh
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  // Ovaj useEffect se pokreće svaki put kad se `searchTerm` promeni
  useEffect(() => {
    if (searchTerm === '') {
      setRezultati(SVI_PROIZVODI); // Ako je pretraga prazna, prikaži sve
    } else {
      // Filtriraj artikle na osnovu unosa
      const filtrirani = SVI_PROIZVODI.filter(proizvod =>
        proizvod.naziv.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setRezultati(filtrirani);
    }
  }, [searchTerm]);

  // Funkcije za Modal
  const handleSignIn = () => {
    setAuthMessage(''); // Resetuj poruku pri otvaranju
    setShowAuthModal(true);
    setAuthMode('signin');
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setAuthMessage(''); // Resetuj poruku i pri zatvaranju
    // Resetujemo polja
    setUsername('');
    setPassword('');
    setEmail('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage(''); // Očisti prethodnu poruku

    if (authMode === 'signup') {
      // --- LOGIKA ZA REGISTRACIJU ---
      try {
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, email }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Ako server vrati grešku (npr. korisnik već postoji)
          setAuthMessage(`Greška: ${data.message}`);
          return;
        }

        setAuthMessage(data.message); // Prikazujemo poruku o uspehu
        setTimeout(closeModal, 2000); // Zatvaramo modal nakon 2 sekunde

      } catch (error) {
        console.error('Greška prilikom registracije:', error);
        setAuthMessage('Došlo je do greške na serveru. Pokušajte ponovo.');
      }
    } else {
      // --- LOGIKA ZA PRIJAVU (dodajemo kasnije) ---
      console.log('Pokušaj prijave sa:', { username, password });
      closeModal();
    }
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setAuthMessage(''); // Očisti poruku pri promeni moda
  };

  const handleCart = () => console.log("Korpa kliknuta!");

  // --- FUNKCIJE ZA DETALJE PROIZVODA ---
  const openProductDetail = (proizvod) => {
    setSelectedProduct(proizvod);
    setQuantity(1);
    // Mock podaci za recenzije (ovo bi išlo sa backenda)
    setReviews([
      { id: 1, user: 'Marko P.', text: 'Odličan kvalitet, sve preporuke!', rating: 5 },
      { id: 2, user: 'Jelena M.', text: 'Brza isporuka, voće je sveže.', rating: 4 },
    ]);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount)); // Ne može manje od 1
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    setReviews([...reviews, { id: Date.now(), user: 'Vi', text: newReview, rating: 5 }]);
    setNewReview('');
  };

  // --- Glavni sajt se sada uvek prikazuje ---
  return (
    <div className="App">
      <header className="header">
        <div className="logo">Suvo Voće</div>

        <nav className="navigation">
          <a href="#" className="nav-link">Početna</a>
          <a href="#" className="nav-link">Proizvodi</a>
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
          <button className="btn btn-primary" onClick={handleSignIn}>Prijavi se</button>
          <button className="btn btn-icon" onClick={handleCart}>
            <FiShoppingCart size={24} />
            <span className="cart-count">0</span>
          </button>
        </div>
      </header>

      <main className="content-area">
        {selectedProduct ? (
          // --- PRIKAZ DETALJA PROIZVODA ---
          <div className="product-detail-view">
            <button className="back-btn" onClick={closeProductDetail}>
              <FiArrowLeft /> Nazad na ponudu
            </button>

            <div className="detail-container">
              <div className="detail-image-wrapper">
                <div className="product-image-placeholder" style={{ height: '100%', fontSize: '10rem' }}>
                  <span>{selectedProduct.naziv.charAt(0)}</span>
                </div>
              </div>
              
              <div className="detail-info">
                <h1>{selectedProduct.naziv}</h1>
                <span className="detail-price">{selectedProduct.cena}</span>
                <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '2rem' }}>
                  Najkvalitetnije sušeno voće, pažljivo birano i pakovano da zadrži svu svežinu i ukus. Savršeno za užinu ili kao dodatak vašim omiljenim jelima.
                </p>

                <div className="quantity-selector">
                  <button className="qty-btn" onClick={() => handleQuantityChange(-1)}><FiMinus /></button>
                  <span className="qty-value">{quantity} kg</span>
                  <button className="qty-btn" onClick={() => handleQuantityChange(1)}><FiPlus /></button>
                </div>

                <button className="add-to-cart-large" onClick={handleCart}>
                  DODAJ U KORPU - {(parseInt(selectedProduct.cena) * quantity)} RSD
                </button>
              </div>
            </div>

            <div className="reviews-section">
              <h3>Recenzije i Komentari ({reviews.length})</h3>
              
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-user">{review.user}</span>
                      <div className="review-stars">
                        {[...Array(review.rating)].map((_, i) => <FiStar key={i} fill="#f1c40f" stroke="none" />)}
                      </div>
                    </div>
                    <p className="review-text">{review.text}</p>
                  </div>
                ))}
              </div>

              <form className="review-form" onSubmit={submitReview}>
                <textarea 
                  placeholder="Napišite vaš utisak..." 
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Pošalji komentar</button>
              </form>
            </div>
          </div>
        ) : (
          // --- PRIKAZ LISTE PROIZVODA (GRID) ---
          <>
            <h2 className="section-title">Naša Ponuda ({rezultati.length})</h2>
            {rezultati.length > 0 ? (
              <div className="product-grid">
                {rezultati.map((proizvod) => (
                  <div key={proizvod.id} className="product-card" onClick={() => openProductDetail(proizvod)}>
                    <div className="product-image-placeholder">
                      <span>{proizvod.naziv.charAt(0)}</span>
                    </div>
                    <div className="product-info">
                      <h3>{proizvod.naziv}</h3>
                      <span className="product-price">{proizvod.cena}</span>
                      <button className="btn-add-cart" onClick={(e) => { e.stopPropagation(); handleCart(); }}>
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
        )}
      </main>

      {/* --- FOOTER --- */}
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
              <li><a href="#">Početna</a></li>
              <li><a href="#">Proizvodi</a></li>
              <li><a href="#">O Nama</a></li>
              <li><a href="#">Kontakt</a></li>
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
        
        <div className="footer-bottom">
          <p>&copy; 2026 Suvo Voće. Sva prava zadržana.</p>
        </div>
      </footer>

      {/* --- MODAL ZA PRIJAVU / REGISTRACIJU --- */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>&times;</button>
            
            <h2>{authMode === 'signin' ? 'Dobrodošli nazad' : 'Napravi nalog'}</h2>

            {/* Mesto za prikaz poruka */}
            {authMessage && <p className={`auth-message ${authMessage.startsWith('Greška') ? 'error' : 'success'}`}>{authMessage}</p>}
            
            <form onSubmit={handleAuthSubmit}>
              <input 
                type="text" 
                placeholder="Korisničko ime" 
                className="auth-input" 
                value={username}
                onChange={(e) => { setUsername(e.target.value); setAuthMessage(''); }}
                required 
              />
              <input 
                type="password" 
                placeholder="Lozinka" 
                className="auth-input" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthMessage(''); }}
                required 
              />
              {authMode === 'signup' && 
                <input type="email" placeholder="Email adresa" className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value); setAuthMessage(''); }} required />}
              
              <button type="submit" className="btn btn-primary auth-submit">
                {authMode === 'signin' ? 'Prijavi se' : 'Registruj se'}
              </button>
            </form>

            <div className="auth-switch">
              {authMode === 'signin' ? (
                <p>Nemaš nalog? <span onClick={() => switchAuthMode('signup')}>Registruj se ovde</span></p>
              ) : (
                <p>Već imaš nalog? <span onClick={() => switchAuthMode('signin')}>Prijavi se</span></p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
