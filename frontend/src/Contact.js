import React, { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

const Contact = ({ t, API_URL }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState(null); // Za prikaz poruka o uspehu/grešci

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formStatus) setFormStatus(null); // Skloni poruku čim korisnik krene da kuca
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({ type: 'error', message: 'Molimo popunite sva polja.' });
      return;
    }
    setFormStatus({ type: 'sending' });

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setFormStatus({ 
          type: 'success', 
          message: `Hvala ${formData.name}, vaša poruka je uspešno poslata! Javićemo vam se uskoro.` 
        });
        setFormData({ name: '', email: '', message: '' }); // Resetuj formu
      } else {
        setFormStatus({ type: 'error', message: data.message || 'Došlo je do greške.' });
      }
    } catch (error) {
      console.error('Greška pri slanju poruke:', error);
      setFormStatus({ type: 'error', message: 'Greška na serveru. Proverite da li je pokrenut.' });
    }
  };

  return (
    <div className="page-container">
      <div className="hero-section">
        <h1>{t.contact.title} <span className="highlight">{t.contact.titleHighlight}</span></h1>
        <p className="subtitle">{t.contact.subtitle}</p>
      </div>

      {/* Unified container for a modern look */}
      <div className="checkout-unified-container">
        {/* Left Panel: Contact Info */}
        <div className="contact-info-panel">
          <h3><FiMapPin /> {t.contact.location}</h3>
          <p>Bulevar Zdravlja 123<br />11000 Beograd, Srbija</p>
          
          <h3><FiPhone /> {t.contact.phone}</h3>
          <p>+381 60 123 4567</p>
          
          <h3><FiMail /> {t.contact.email}</h3>
          <p>info@benko.rs</p>

          <h3><FiClock /> {t.contact.workingHours}</h3>
          <p>Ponedeljak - Petak: 08:00 - 20:00</p>
          <p>Vikend: 10:00 - 15:00</p>
        </div>

        {/* Right Panel: Contact Form */}
        <form className="checkout-form-panel" onSubmit={handleSubmit} noValidate>
          <h3>
            {t.contact.formTitle}
          </h3>
          {formStatus && formStatus.type !== 'sending' && (
            <div className={`form-status ${formStatus.type}`}>
              {formStatus.message}
            </div>
          )}
          {/* Polje za ime sa plutajućom labelom */}
          <div className="form-group">
            <input 
              type="text" 
              id="name"
              name="name" 
              className="checkout-input"
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder={t.contact.name}
            />
          </div>
          {/* Polje za email sa plutajućom labelom */}
          <div className="form-group">
            <input 
              type="email" 
              id="email"
              name="email" 
              className="checkout-input"
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder={t.contact.email}
            />
          </div>
          {/* Polje za poruku sa plutajućom labelom */}
          <div className="form-group">
            <textarea 
              name="message" 
              id="message"
              className="checkout-input"
              value={formData.message} 
              onChange={handleChange} 
              required 
              placeholder={t.contact.msgPlaceholder}
              rows="5"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={formStatus?.type === 'sending'}>
            {formStatus?.type === 'sending' ? t.contact.sending : t.contact.sendBtn}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;