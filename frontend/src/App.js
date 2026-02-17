import React, { useState, useEffect } from 'react';
import { FiShoppingCart } from 'react-icons/fi'; // Uvozimo ikonicu korpe
import './App.css';

// Podaci koje ćemo pretraživati (ovo bi inače dolazilo sa backenda)
const SVI_PROIZVODI = [
  { id: 1, naziv: 'Suve Šljive', cena: '550 RSD/kg' },
  { id: 2, naziv: 'Suve Smokve', cena: '800 RSD/kg' },
  { id: 3, naziv: 'Urme', cena: '720 RSD/kg' },
  { id: 4, naziv: 'Suvo Grožđe', cena: '480 RSD/kg' },
  { id: 5, naziv: 'Suve Kajsije', cena: '950 RSD/kg' },
  { id: 6, naziv: 'Ukrasne Kriške Narandže', cena: '1200 RSD/kg' },
  { id: 7, naziv: 'Brusnica', cena: '1100 RSD/kg' },
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rezultati, setRezultati] = useState(SVI_PROIZVODI);

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

  // Funkcije za dugmiće (za sada samo ispisuju u konzolu)
  const handleSignIn = () => console.log("Sign In kliknut!");
  const handleSignUp = () => console.log("Sign Up kliknut!");
  const handleCart = () => console.log("Korpa kliknuta!");

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
          <button className="btn btn-secondary" onClick={handleSignIn}>Prijavi se</button>
          <button className="btn btn-icon" onClick={handleCart}>
            <FiShoppingCart size={24} />
            <span className="cart-count">0</span>
          </button>
        </div>
      </header>

      <main className="content-area">
        <h2>Naša Ponuda ({rezultati.length})</h2>
        {rezultati.length > 0 ? (
          <ul className="search-results">
            {rezultati.map((proizvod) => (
              <li key={proizvod.id}>
                <span>{proizvod.naziv}</span>
                <span className="product-price">{proizvod.cena}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nema rezultata za "{searchTerm}"</p>
        )}
      </main>
    </div>
  );
}

export default App;
