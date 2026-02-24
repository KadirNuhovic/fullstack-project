import React, { useState } from 'react';
import './BenkoStyles.css';

const Contact = () => {
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
        <h1>Kontaktirajte <span className="highlight">Nas</span></h1>
        <p className="subtitle">Tu smo da odgovorimo na sva vaša pitanja.</p>
      </div>

      <div className="contact-wrapper">
        {/* Kontakt Info */}
        <div className="contact-info animate-slide-left delay-1">
          <h3>📍 Gde se nalazimo</h3>
          <p>Bulevar Zdravlja 123<br />11000 Beograd, Srbija</p>
          
          <h3>📞 Telefon</h3>
          <p>+381 60 123 4567</p>
          
          <h3>📧 Email</h3>
          <p>info@benko.rs</p>

          <div className="working-hours">
            <h4>Radno vreme:</h4>
            <p>Ponedeljak - Petak: 08:00 - 20:00</p>
            <p>Vikend: 10:00 - 15:00</p>
          </div>
        </div>

        {/* Kontakt Forma */}
        <form className="contact-form animate-slide-right delay-2" onSubmit={handleSubmit}>
          <h3>Pošaljite nam poruku</h3>
          {formStatus && formStatus.type !== 'sending' && (
            <div className={`form-status ${formStatus.type}`}>
              {formStatus.message}
            </div>
          )}
          <div className="form-group">
            <label>Ime i Prezime</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="Vaše ime..."
            />
          </div>
          <div className="form-group">
            <label>Email Adresa</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="vas@email.com"
            />
          </div>
          <div className="form-group">
            <label>Poruka</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required 
              placeholder="Kako možemo da vam pomognemo?"
              rows="5"
            ></textarea>
          </div>
          <button type="submit" className="btn-submit" disabled={formStatus?.type === 'sending'}>
            {formStatus?.type === 'sending' ? 'Slanje...' : 'Pošalji Poruku 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;