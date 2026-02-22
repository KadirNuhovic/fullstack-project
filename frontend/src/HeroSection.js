import React from 'react';
import './HeroSection.css';

function HeroSection({ setActivePage }) {
  return (
    <div className="hero-section">
      <h1>Dobrodošli u svet Suvog Voća</h1>
      <p>Najzdraviji slatkiši iz prirode, pažljivo birani za vas. Otkrijte našu ponudu najkvalitetnijeg sušenog voća.</p>
      <button className="btn btn-primary" onClick={() => setActivePage('products')}>Pogledaj Ponudu</button>
    </div>
  );
}

export default HeroSection;