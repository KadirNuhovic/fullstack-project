import React from 'react';
import './BenkoStyles.css';

const About = ({ t }) => {
  return (
    <div className="page-container">
      <div className="about-hero-container">
        <div className="about-hero-text animate-slide-right delay-1">
          <h1>{t.about.title} <span className="highlight">{t.about.titleHighlight}</span></h1>
          <p className="subtitle">{t.about.subtitle}</p>
        </div>
        <div className="about-hero-image animate-slide-left delay-2">
          <img src="/images/prva.jpg" alt="Posuda sa suvim voćem" loading="lazy" />
        </div>
      </div>

      <div className="content-section animate-fade-in delay-3">
        <div className="card animate-slide-up delay-1">
          <h2>{t.about.missionTitle}</h2>
          <p>
            {t.about.missionText}
          </p>
        </div>

        <div className="card animate-slide-up delay-2">
          <h2>{t.about.qualityTitle}</h2>
          <p>
            {t.about.qualityText}
          </p>
        </div>

        <div className="card animate-slide-up delay-3">
          <h2>{t.about.partnerTitle}</h2>
          <p>
            {t.about.partnerText}
          </p>
        </div>
      </div>
      
      <div className="stats-container animate-fade-in delay-4">
        <div className="stat-box">
          <h3>100%</h3>
          <p>{t.about.stat1}</p>
        </div>
        <div className="stat-box">
          <h3>30+</h3>
          <p>{t.about.stat2}</p>
        </div>
        <div className="stat-box">
          <h3>5000+</h3>
          <p>{t.about.stat3}</p>
        </div>
      </div>
    </div>
  );
};

export default About;