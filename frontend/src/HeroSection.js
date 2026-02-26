import React from 'react';
import './HeroSection.css';

function HeroSection({ setActivePage, t }) {
  return (
    <section className="hero-container">
      <div className="hero-background" style={{ backgroundImage: "url('/images/prva.jpg')" }}>
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <h1>{t.hero.titlePrefix} <span className="highlight">{t.hero.titleHighlight}</span></h1>
        <p>{t.hero.subtitle}</p>
        <button className="btn btn-primary btn-lg" onClick={() => setActivePage('products')}>{t.hero.cta}</button>
      </div>
    </section>
  );
}

export default HeroSection;