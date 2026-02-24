import React from 'react';
import './BenkoStyles.css';
import { FiCheckCircle, FiCreditCard, FiTruck } from 'react-icons/fi';

const Checkout = () => {
  return (
    <div className="page-container">
      <div className="hero-section animate-fade-in">
        <h1>Završetak <span className="highlight">Kupovine</span></h1>
        <p className="subtitle">Hvala na poverenju! Molimo vas da proverite detalje.</p>
      </div>

      <div className="checkout-container">
        <div className="checkout-card animate-slide-up delay-1">
          <FiCheckCircle size={50} color="#2ecc71" />
          <h2>Porudžbina je primljena!</h2>
          <p>Vaša porudžbina je uspešno kreirana. Uskoro ćete dobiti email sa potvrdom i detaljima.</p>
        </div>

        <div className="checkout-card animate-slide-up delay-2">
          <FiCreditCard size={50} color="#3498db" />
          <h2>Informacije o plaćanju</h2>
          <p>Plaćanje se vrši pouzećem, direktno kuriru prilikom preuzimanja pošiljke. Molimo pripremite tačan iznos.</p>
          <div className="payment-details">
            <strong>Primalac:</strong> Benko Suvo Voće DOO<br />
            <strong>Svrha uplate:</strong> Otkupnina za porudžbinu
          </div>
        </div>

        <div className="checkout-card animate-slide-up delay-3">
          <FiTruck size={50} color="#e67e22" />
          <h2>Dostava</h2>
          <p>Očekivani rok za dostavu je 2-3 radna dana. Bićete obavešteni od strane kurirske službe pre isporuke.</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;