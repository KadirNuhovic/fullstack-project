import React, { useEffect, useRef, useState } from 'react';
import { FiSun, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import './InfoSection.css';

function InfoSection({ t }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); // Animacija se dešava samo jednom
          }
        });
      },
      { threshold: 0.2 } // Pokreni kad se vidi 20% sekcije
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const cards = [
    {
      title: t.info.card1Title,
      text: t.info.card1Text,
      icon: <FiMapPin />
    },
    {
      title: t.info.card2Title,
      text: t.info.card2Text,
      icon: <FiSun />
    },
    {
      title: t.info.card3Title,
      text: t.info.card3Text,
      icon: <FiCheckCircle />
    }
  ];

  return (
    <div className="info-section" ref={sectionRef}>
      <h2 className={`info-title ${isVisible ? 'visible' : ''}`}>{t.info.title}</h2>
      <div className="info-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`info-card ${index % 2 === 0 ? 'left' : 'right'} ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: `${index * 0.2}s` }}
          >
            <div className="info-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfoSection;