import React from 'react';
import './HeroSection.css';

function HeroSection({ setActivePage }) {
  return (
    <div className="hero-container">
      <div className="hero-background" style={{ backgroundImage: "url('/images/prva.jpg')" }}>
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
       
        <h1>Dobrodošli u svet <span className="highlight">Suvog Voća</span></h1>
        <p>Najzdraviji slatkiši iz prirode, pažljivo birani za vas. Otkrijte našu ponudu najkvalitetnijeg sušenog voća.</p>
        <button className="btn btn-primary btn-lg" onClick={() => setActivePage('products')}>Pogledaj Ponudu</button>
      </div>
    </div>
  );
}

export default HeroSection;