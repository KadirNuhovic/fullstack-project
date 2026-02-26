import React from 'react';
import { FiMail } from 'react-icons/fi';

// SVG ikonica za kamion, stilizovana da odgovara postojećem dizajnu
const TruckIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ color: '#61dafb' }} // Usklađujemo boju sa dizajnom
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
    <path d="M15 18H9"></path>
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.34a1 1 0 0 0-.2-.6l-1.4-1.86a1 1 0 0 0-.8-.2H15v7Z"></path>
    <circle cx="7.5" cy="18.5" r="2.5"></circle>
    <circle cx="17.5" cy="18.5" r="2.5"></circle>
  </svg>
);

/**
 * Komponenta za unos podataka o dostavi.
 * Koristi postojeće stilove iz App.css za form-group, checkout-input, itd.
 * Ima "slide-up" animaciju prilikom pojavljivanja.
 */
const DeliveryInfo = ({ formData, onChange, t, emailError }) => {
  return (
    // Koristimo postojeću klasu za panel i dodajemo novu za animaciju
    // Uklonili smo div sa animacijom odavde jer će biti na nivou cele forme
    <>
      <h3>
        <TruckIcon />
        <span>{t.checkout.deliveryData}</span>
      </h3>

      {/* Puno ime i prezime */}
      <div className="form-group">
        <input
          type="text"
          id="fullName"
          name="fullName"
          className="checkout-input"
          value={formData.fullName || ''}
          onChange={onChange}
          placeholder=" " // Važno za "floating label" efekat
          required
        />
        <label htmlFor="fullName">{t.checkout.name}</label>
      </div>

      {/* Adresa */}
      <div className="form-group">
        <input
          type="text"
          id="address"
          name="address"
          className="checkout-input"
          value={formData.address || ''}
          onChange={onChange}
          placeholder=" "
          required
        />
        <label htmlFor="address">{t.checkout.address}</label>
      </div>

      {/* Red za Grad i Poštanski broj */}
      <div className="form-row">
        <div className="form-group">
          <input
            type="text"
            id="city"
            name="city"
            className="checkout-input"
            value={formData.city || ''}
            onChange={onChange}
            placeholder=" "
            required
          />
          <label htmlFor="city">{t.checkout.city}</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            pattern="[0-9]*"
            className="checkout-input"
            value={formData.postalCode || ''}
            onChange={onChange}
            placeholder=" "
            required
          />
          <label htmlFor="postalCode">Poštanski broj</label>
        </div>
      </div>

      {/* Broj telefona */}
      <div className="form-group">
        <input
          type="tel"
          id="phone"
          name="phone"
          className="checkout-input"
          value={formData.phone || ''}
          onChange={onChange}
          placeholder=" "
          required
        />
        <label htmlFor="phone">{t.checkout.phone}</label>
      </div>

      {/* Polje za email, sada je deo ove komponente */}
      <h3 style={{marginTop: '30px'}}><FiMail /> Kontakt Email</h3>
      <div className="form-group">
        <input 
          type="email" 
          id="email"
          name="email" 
          value={formData.email || ''}
          onChange={onChange} 
          className={`checkout-input ${emailError ? 'input-error' : ''}`}
          placeholder=" "
          required 
        />
        <label htmlFor="email">{t.checkout.email}</label>
        {emailError && <p className="error-text" style={{marginTop: '5px', position: 'relative'}}>{emailError}</p>}
      </div>
    </>
  );
};

export default DeliveryInfo;