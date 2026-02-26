import React from 'react';
import { FiTarget, FiAward, FiUsers, FiGift } from 'react-icons/fi';

const About = ({ t }) => {
  return (
    <div className="page-container about-page">
      {/* Hero Section styled like the homepage */}
      <div className="hero-container about-hero-variant">
        <div className="hero-background" style={{ backgroundImage: "url('/images/prva.jpg')" }}></div>
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <h1>{t.about.title} <span className="highlight">{t.about.titleHighlight}</span></h1>
          <p className="hero-subtitle">{t.about.subtitle}</p>
        </div>
      </div>

      {/* Main content area for consistent padding */}
      <div className="content-area">
        
        {/* Combined "Naša Priča" & "Ko Smo Mi" Section */}
        <section className="about-page-section">
          <div className="about-intro-card">
            <div className="about-intro-image">
              <img src="/images/druga.jpg" alt="Sveže voće i orasi" loading="lazy" />
            </div>
            <div className="about-intro-text">
              <h2 className="section-title left-aligned">Naša Priča</h2>
              <p>Sve je počelo iz strasti prema zdravom životu i želje da najkvalitetnije prirodne proizvode učinimo dostupnim svima. Od skromnih početaka, vođeni ljubavlju prema autentičnim ukusima, gradili smo naš san.</p>
              <h2 className="section-title left-aligned">Ko Smo Mi?</h2>
              <p>Mi smo tim posvećen pružanju 100% prirodnih proizvoda. Verujemo da zdrava ishrana ne treba da bude kompromis, već čisto zadovoljstvo. Svaki naš proizvod je pažljivo odabran, od polja do pakovanja, kako bismo osigurali vrhunski kvalitet i svežinu. Naša misija je da inspirišemo i podržimo vaš put ka zdravijem i srećnijem životu.</p>
            </div>
          </div>
        </section>

        {/* "Naši Principi" Section - styled like InfoSection from homepage */}
        <section className="info-section about-page-section">
          <h2 className="info-title visible">Naši Principi</h2>
          <div className="info-grid">
            <div className="info-card visible">
              <div className="info-icon"><FiTarget /></div>
              <h3>{t.about.missionTitle}</h3>
              <p>{t.about.missionText}</p>
            </div>
            <div className="info-card visible" style={{transitionDelay: '0.2s'}}>
              <div className="info-icon"><FiAward /></div>
              <h3>{t.about.qualityTitle}</h3>
              <p>{t.about.qualityText}</p>
            </div>
            <div className="info-card visible" style={{transitionDelay: '0.4s'}}>
              <div className="info-icon"><FiUsers /></div>
              <h3>{t.about.partnerTitle}</h3>
              <p>{t.about.partnerText}</p>
            </div>
          </div>
        </section>

        {/* "Upoznajte Naš Tim" Section */}
        <section className="about-page-section">
          <h2 className="section-title">Upoznajte Naš Tim</h2>
          <div className="team-grid">
            <div className="team-member-card">
              <img src="/images/team1.jpg" alt="Član tima 1" className="team-member-photo" />
              <h3>Ana Petrović</h3>
              <p className="team-member-role">Osnivač i CEO</p>
              <p className="team-member-bio">Anina vizija je srce naše kompanije. Njena strast prema prirodi pokreće nas da budemo bolji svaki dan.</p>
            </div>
            <div className="team-member-card">
              <img src="/images/team2.jpg" alt="Član tima 2" className="team-member-photo" />
              <h3>Marko Jovanović</h3>
              <p className="team-member-role">Menadžer Kvaliteta</p>
              <p className="team-member-bio">Marko se brine da svaki proizvod koji stigne do vas zadovoljava najviše standarde kvaliteta.</p>
            </div>
            <div className="team-member-card">
              <img src="/images/team3.jpg" alt="Član tima 3" className="team-member-photo" />
              <h3>Jelena Đorđević</h3>
              <p className="team-member-role">Korisnička Podrška</p>
              <p className="team-member-bio">Jelena je tu da odgovori na sva vaša pitanja i osigura da vaše iskustvo sa nama bude savršeno.</p>
            </div>
          </div>
        </section>

        {/* "Naš Uspeh u Brojkama" Section */}
        <section className="about-page-section">
          <h2 className="section-title">Naš Uspeh u Brojkama</h2>
          <div className="stats-grid-container">
            <div className="stat-card">
              <div className="stat-card-icon"><FiAward /></div>
              <h3>100%</h3>
              <p>{t.about.stat1}</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><FiGift /></div>
              <h3>30+</h3>
              <p>{t.about.stat2}</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><FiUsers /></div>
              <h3>5000+</h3>
              <p>{t.about.stat3}</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;