import React from 'react';
import './BenkoStyles.css';

const About = () => {
  return (
    <div className="page-container">
      <div className="about-hero-container">
        <div className="about-hero-text animate-slide-right delay-1">
          <h1>Naša <span className="highlight">Priča</span></h1>
          <p className="subtitle">Strast prema kvalitetu, posvećenost prirodi.</p>
        </div>
        <div className="about-hero-image animate-slide-left delay-2">
          <img src="/images/prva.jpg" alt="Posuda sa suvim voćem" />
        </div>
      </div>

      <div className="content-section animate-fade-in delay-3">
        <div className="card animate-slide-up delay-1">
          <h2>🌱 Naša Misija</h2>
          <p>
            U svetu brze hrane i veštačkih ukusa, Benko stoji kao bastion prirodnog. Naša misija je da na vaš sto donesemo samo najfinije, ručno birano sušeno voće, čuvajući autentičan ukus i nutritivnu vrednost koju samo priroda može da pruži.
          </p>
        </div>

        <div className="card animate-slide-up delay-2">
          <h2>🏆 Standard Kvaliteta</h2>
          <p>
            Kvalitet nije opcija, već obećanje. Svaki plod prolazi kroz rigoroznu selekciju, od osunčanih voćnjaka do pakovanja. Ne koristimo veštačke konzervanse, aditive niti dodate šećere. Naš potpis je 100% čista energija prirode.
          </p>
        </div>

        <div className="card animate-slide-up delay-3">
          <h2>🤝 Partner Vašeg Zdravlja</h2>
          <p>
            Mi nismo samo prodavci; mi smo vaši partneri u zdravom načinu života. Sa decenijama iskustva, spajamo tradicionalne metode sušenja sa modernom tehnologijom kako bismo vam pružili proizvod koji je sinonim za poverenje, svežinu i nezaboravan ukus.
          </p>
        </div>
      </div>
      
      <div className="stats-container animate-fade-in delay-4">
        <div className="stat-box">
          <h3>100%</h3>
          <p>Prirodno</p>
        </div>
        <div className="stat-box">
          <h3>30+</h3>
          <p>Godina tradicije</p>
        </div>
        <div className="stat-box">
          <h3>5000+</h3>
          <p>Zadovoljnih kupaca</p>
        </div>
      </div>
    </div>
  );
};

export default About;