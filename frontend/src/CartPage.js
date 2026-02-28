import React from 'react';
import { FiTrash2, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';
import './CartPage.css';

const CartPage = ({ cart, onRemove, onUpdateQuantity, onCheckout, setActivePage, t }) => {
  const total = Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="empty-cart-container">
        <h2>{t.cart.emptyTitle}</h2>
        <p>{t.cart.emptyText}</p>
        <button className="btn btn-primary" onClick={() => setActivePage('products')}>
          <FiArrowLeft /> {t.cart.backBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page-layout">
      <div className="cart-items-panel">
        <h1 className="cart-title">{t.cart.title} ({Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0})</h1>
        <div className="cart-items-list">
          {cart.map(item => (
            <div key={item.id} className="cart-page-item">
              <img src={item.image} alt={item.name} className="cart-page-item-image" loading="lazy" />
              <div className="cart-page-item-details">
                <h3>{item.name}</h3>
                <p className="cart-page-item-price">{item.price} RSD</p>
              </div>
              <div className="cart-page-item-quantity">
                <div className="quantity-selector">
                  <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}><FiMinus /></button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}><FiPlus /></button>
                </div>
              </div>
              <div className="cart-page-item-total">
                <p>{item.price * item.quantity} RSD</p>
              </div>
              <div className="cart-page-item-remove">
                <button className="btn-icon" onClick={() => onRemove(item.id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cart-summary-panel">
        <h2>{t.cart.totalPay}</h2>
        <div className="summary-row">
          <span>{t.cart.total}</span>
          <span>{total} RSD</span>
        </div>
        {/* Add shipping and other costs here if needed */}
        <div className="summary-row total">
          <span>{t.cart.total}</span>
          <span>{total} RSD</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={onCheckout}>
          {t.cart.checkout}
        </button>
        <button className="btn btn-secondary btn-block" onClick={() => setActivePage('products')}>
          {t.cart.continue}
        </button>
      </div>
    </div>
  );
};

export default CartPage;