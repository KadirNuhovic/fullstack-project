import React, { useEffect, useRef, useState } from 'react';
import { FiSun, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import './InfoSection.css';

function InfoSection() {
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
      title: "Domaća Berba",
      text: "Naše voće dolazi iz srca Šumadije, gde se pažljivo bira svaki plod. Berba se vrši ručno u optimalnom trenutku zrelosti.",
      icon: <FiMapPin />
    },
    {
      title: "Prirodno Sušenje",
      text: "Koristimo proces sporog sušenja na niskim temperaturama kako bismo sačuvali sve nutrijente, ukus i prirodnu boju voća.",
      icon: <FiSun />
    },
    {
      title: "Kvalitet i Sigurnost",
      text: "Svako pakovanje prolazi strogu kontrolu kvaliteta. Bez dodatog šećera i konzervansa - samo 100% čisto voće.",
      icon: <FiCheckCircle />
    }
  ];

  return (
    <div className="info-section" ref={sectionRef}>
      <h2 className={`info-title ${isVisible ? 'visible' : ''}`}>Put od Voćnjaka do Vas</h2>
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