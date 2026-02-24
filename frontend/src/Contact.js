import React, { useState } from 'react';
import './BenkoStyles.css';

const Contact = ({ t }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState(null); // Za prikaz poruka o uspehu/grešci

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus({ type: 'sending' });

    // Simulacija slanja na server
    setTimeout(() => {
      // Ovde bi išla logika za slanje na backend
      console.log('Podaci poslati:', formData);

      // Uspešno poslato
      setFormStatus({ 
        type: 'success', 
        message: `Hvala ${formData.name}, vaša poruka je uspešno poslata! Javićemo vam se uskoro.` 
      });
      setFormData({ name: '', email: '', message: '' });

    }, 1500); // Simuliramo kašnjenje od 1.5s
  };

  return (
    <div className="page-container">
      <div className="hero-section">
        <h1>{t.contact.title} <span className="highlight">{t.contact.titleHighlight}</span></h1>
        <p className="subtitle">{t.contact.subtitle}</p>
      </div>

      <div className="contact-wrapper">
        {/* Kontakt Info */}
        <div className="contact-info animate-slide-left delay-1">
          <h3>📍 {t.contact.location}</h3>
          <p>Bulevar Zdravlja 123<br />11000 Beograd, Srbija</p>
          
          <h3>📞 {t.contact.phone}</h3>
          <p>+381 60 123 4567</p>
          
          <h3>📧 {t.contact.email}</h3>
          <p>info@benko.rs</p>

          <div className="working-hours">
            <h4>{t.contact.workingHours}:</h4>
            <p>Ponedeljak - Petak: 08:00 - 20:00</p>
            <p>Vikend: 10:00 - 15:00</p>
          </div>
        </div>

        {/* Kontakt Forma */}
        <form className="contact-form animate-slide-right delay-2" onSubmit={handleSubmit}>
          <h3>{t.contact.formTitle}</h3>
          {formStatus && formStatus.type !== 'sending' && (
            <div className={`form-status ${formStatus.type}`}>
              {formStatus.message}
            </div>
          )}
          <div className="form-group">
            <label>{t.checkout.name}</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder={t.contact.namePlaceholder}
            />
          </div>
          <div className="form-group">
            <label>{t.checkout.email}</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder={t.contact.emailPlaceholder}
            />
          </div>
          <div className="form-group">
            <label>{t.contact.formTitle}</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required 
              placeholder={t.contact.msgPlaceholder}
              rows="5"
            ></textarea>
          </div>
          <button type="submit" className="btn-submit" disabled={formStatus?.type === 'sending'}>
            {formStatus?.type === 'sending' ? t.contact.sending : t.contact.sendBtn}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;