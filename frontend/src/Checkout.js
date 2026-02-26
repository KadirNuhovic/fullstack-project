import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiHome, FiCreditCard, FiTruck } from 'react-icons/fi';

const Checkout = ({ cart, setActivePage, setCart, API_URL, t }) => {
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('pouzece');
  const [formStatus, setFormStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
    // Brišemo grešku čim korisnik počne da kuca
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePaymentKeyDown = (e, method) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setPaymentMethod(method);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!customerData.name.trim()) newErrors.name = t.checkout.errorName;
    if (!customerData.email.trim() || !/\S+@\S+\.\S+/.test(customerData.email)) newErrors.email = t.checkout.errorEmail;
    if (!customerData.phone.trim()) newErrors.phone = t.checkout.errorPhone;
    if (!customerData.address.trim()) newErrors.address = t.checkout.errorAddress;
    if (!customerData.city.trim()) newErrors.city = t.checkout.errorCity;
    if (!customerData.postalCode.trim()) newErrors.postalCode = t.checkout.errorPostalCode;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setFormStatus({ type: 'error', message: t.checkout.errorFillAll });
      return;
    }

    setFormStatus({ type: 'sending' });

    const orderData = {
      cart,
      customerData,
      paymentMethod,
      total: cartTotal,
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();

      if (response.ok) {
        setFormStatus({ type: 'success', message: data.message });
        setCart([]); // Isprazni korpu na frontendu
        // Preusmeri na početnu stranicu nakon 3 sekunde
        setTimeout(() => {
          setActivePage('home');
        }, 3000);
      } else {
        setFormStatus({ type: 'error', message: data.message || t.checkout.errorServer });
      }
    } catch (error) {
      console.error("Greška pri slanju porudžbine:", error);
      setFormStatus({ type: 'error', message: t.checkout.errorServer });
    }
  };

  // Prikaz poruke o uspešnoj porudžbini
  if (formStatus?.type === 'success') {
    return (
      <div className="page-container">
        <div className="checkout-success-container">
          <h2>{t.checkout.successTitle}</h2>
          <p>{formStatus.message}</p>
          <p>{t.checkout.successRedirect}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="hero-section">
        <h1>{t.checkout.title}</h1>
        <p className="subtitle">{t.checkout.subtitle}</p>
      </div>

      <form className="checkout-unified-container" onSubmit={handleSubmit} noValidate>
        {/* Levi Panel: Forma */}
        <div className="checkout-form-panel">
          {formStatus && formStatus.type === 'error' && (
            <div className="form-status error">{formStatus.message}</div>
          )}
          
          <h3><FiUser /> {t.checkout.customerInfo}</h3>
          <div className="form-group">
            <input type="text" id="name" name="name" className={`checkout-input ${errors.name ? 'input-error' : ''}`} value={customerData.name} onChange={handleChange} required placeholder={t.checkout.name} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input type="email" id="email" name="email" className={`checkout-input ${errors.email ? 'input-error' : ''}`} value={customerData.email} onChange={handleChange} required placeholder={t.checkout.email} />
            </div>
            <div className="form-group">
              <input type="tel" id="phone" name="phone" className={`checkout-input ${errors.phone ? 'input-error' : ''}`} value={customerData.phone} onChange={handleChange} required placeholder={t.checkout.phone} />
            </div>
          </div>
          
          <h3><FiHome /> {t.checkout.deliveryInfo}</h3>
          <div className="form-group">
            <input type="text" id="address" name="address" className={`checkout-input ${errors.address ? 'input-error' : ''}`} value={customerData.address} onChange={handleChange} required placeholder={t.checkout.address} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input type="text" id="city" name="city" className={`checkout-input ${errors.city ? 'input-error' : ''}`} value={customerData.city} onChange={handleChange} required placeholder={t.checkout.city} />
            </div>
            <div className="form-group">
              <input type="text" id="postalCode" name="postalCode" pattern="[0-9]*" className={`checkout-input ${errors.postalCode ? 'input-error' : ''}`} value={customerData.postalCode} onChange={handleChange} required placeholder={t.checkout.postalCode} />
            </div>
          </div>

          <h3><FiCreditCard /> {t.checkout.paymentMethod}</h3>
          <div className="payment-options">
            <div 
              className={`payment-option ${paymentMethod === 'pouzece' ? 'active' : ''}`} 
              onClick={() => setPaymentMethod('pouzece')}
              onKeyDown={(e) => handlePaymentKeyDown(e, 'pouzece')}
              role="button"
              tabIndex="0"
            >
              <div className="radio-circle"></div>
              <FiTruck />
              <span>{t.checkout.cashOnDelivery}</span>
            </div>
            <div 
              className={`payment-option ${paymentMethod === 'kartica' ? 'active' : ''}`} 
              onClick={() => setPaymentMethod('kartica')}
              onKeyDown={(e) => handlePaymentKeyDown(e, 'kartica')}
              role="button"
              tabIndex="0">
              <div className="radio-circle"></div>
              <FiCreditCard />
              <span>{t.checkout.cardPayment}</span>
            </div>
          </div>
        </div>

        {/* Desni Panel: Pregled Porudžbine */}
        <div className="checkout-summary-panel">
          <h3>{t.checkout.orderSummary}</h3>
          <div className="summary-items-list">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <img src={item.image} alt={item.name} className="summary-item-image" />
                <div className="summary-item-details">
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-quantity">{t.cart.quantity}: {item.quantity}</span>
                </div>
                <span className="summary-item-price">{item.price * item.quantity} RSD</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-total-row">
              <span>{t.cart.total}</span>
              <span>{cartTotal} RSD</span>
            </div>
            <div className="summary-total-row">
              <span>{t.checkout.shipping}</span>
              <span>{t.checkout.free}</span>
            </div>
            <div className="summary-total-row grand-total">
              <span>{t.cart.totalPay}</span>
              <span>{cartTotal} RSD</span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={formStatus?.type === 'sending'}>
            {formStatus?.type === 'sending' ? t.checkout.processing : t.checkout.placeOrder}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;