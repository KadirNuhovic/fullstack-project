import React, { useState } from 'react';
import './BenkoStyles.css';
import { FiCheckCircle, FiCreditCard, FiTruck, FiUser, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Checkout = ({ setActivePage, cart, setCart, API_URL, t }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' = Cash on Delivery, 'bank' = Bank Transfer
  const [formData, setFormData] = useState({ name: '', address: '', city: '', phone: '', email: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailError, setEmailError] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') setEmailError(''); // Brišemo grešku kad korisnik počne da kuca
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validacija emaila pre slanja
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Molimo vas unesite ispravnu email adresu.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        customerData: formData,
        cart: cart,
        paymentMethod: paymentMethod,
        total: total
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setCart([]); // Isprazni korpu na frontendu
        setIsSubmitted(true); // Prikaži stranicu zahvalnosti
      } else {
        const errorData = await response.json();
        alert(`Došlo je do greške: ${errorData.message || 'Pokušajte ponovo.'}`);
      }
    } catch (error) {
      console.error('Greška pri slanju porudžbine:', error);
      alert('Nije moguće povezati se sa serverom. Proverite konekciju i pokušajte ponovo.');
    }
    setIsProcessing(false);
  };

  // --- PRIKAZ NAKON USPEŠNE PORUDŽBINE ---
  if (isSubmitted) {
    return (
      <div className="page-container">
        <div className="hero-section animate-fade-in">
          <h1>{t.checkout.successTitle} <span className="highlight">{t.checkout.successHighlight}</span></h1>
        </div>
        <div className="checkout-container">
          <div className="checkout-card animate-slide-up delay-1">
            <FiCheckCircle size={60} color="#2ecc71" style={{marginBottom: '20px'}} />
            <h2>{t.checkout.successMsg}</h2>
            <p>Vaš paket će uskoro biti spakovan s ljubavlju.</p>
          </div>

          <div className="checkout-card animate-slide-up delay-2">
            {paymentMethod === 'cod' ? (
              <>
                <FiTruck size={40} color="#e67e22" />
                <h3>{t.checkout.cod}</h3>
                <p>{t.checkout.codMsg} <strong>{total} RSD</strong>.</p>
              </>
            ) : (
              <>
                <FiCreditCard size={40} color="#3498db" />
                <h3>{t.checkout.bank}</h3>
                <p>{t.checkout.bankMsg} <strong>{formData.email}</strong></p>
                <div className="payment-details">
                  <small>(Ovo ćemo povezati kad stignu podaci o računu)</small>
                </div>
              </>
            )}
          </div>

          <button className="btn btn-primary" style={{marginTop: '30px'}} onClick={() => setActivePage('products')}>
            {t.cart.backBtn}
          </button>
        </div>
      </div>
    );
  }

  // --- FORMA ZA PLAĆANJE ---
  return (
    <div className="page-container">
      <div className="hero-section animate-fade-in">
        <h1>{t.checkout.title} <span className="highlight">{t.checkout.titleHighlight}</span></h1>
      </div>

      <div className="checkout-layout">
        {/* LEVA STRANA - FORMA */}
        <form className="checkout-form animate-slide-left delay-1" onSubmit={handleSubmit}>
          <h3><FiUser /> {t.checkout.deliveryData}</h3>
          <div className="form-row">
            <input type="text" name="name" placeholder={t.checkout.name} required onChange={handleInputChange} className="checkout-input" />
            <input type="text" name="phone" placeholder={t.checkout.phone} required onChange={handleInputChange} className="checkout-input" />
          </div>
          <input type="email" name="email" placeholder={t.checkout.email} required onChange={handleInputChange} className={`checkout-input full-width ${emailError ? 'input-error' : ''}`} />
          {emailError && <p className="error-text">{emailError}</p>}
          <input type="text" name="address" placeholder={t.checkout.address} required onChange={handleInputChange} className="checkout-input full-width" />
          <input type="text" name="city" placeholder={t.checkout.city} required onChange={handleInputChange} className="checkout-input full-width" />

          <h3 style={{marginTop: '30px'}}><FiCreditCard /> {t.checkout.paymentMethod}</h3>
          <div className="payment-options">
            <div 
              className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cod')}
            >
              <div className="radio-circle"></div>
              <span>{t.checkout.cod}</span>
            </div>
            <div 
              className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('bank')}
            >
              <div className="radio-circle"></div>
              <span>{t.checkout.bank}</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isProcessing} style={{marginTop: '20px'}}>
            {isProcessing ? t.contact.sending : `${t.checkout.orderBtn} (${total} RSD)`}
          </button>
        </form>

        {/* DESNA STRANA - SUMIRANJE (Ostaje isto jer su brojevi) */}
        <div className="order-summary animate-slide-right delay-2">
          <h3>{t.cart.title}</h3>
          <ul className="summary-list">
            {cart.map(item => (
              <li key={item.id}>
                <span>{item.name} x {item.quantity}</span>
                <span>{item.price * item.quantity} RSD</span>
              </li>
            ))}
          </ul>
          <div className="summary-total-row">
            <span>{t.cart.totalPay}</span>
            <span className="highlight">{total} RSD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;