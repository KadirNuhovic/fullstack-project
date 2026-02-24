import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import './CartSidebar.css';

function CartSidebar({ isOpen, onClose, cart, onRemove, onCheckout, t }) {
  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    if (cart.length > 0) {
      onClose(); // Prvo zatvori korpu
      onCheckout(); // Zatim pozovi funkciju iz App.js koja će isprazniti bazu i prebaciti stranicu
    }
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>{t.cartSidebar.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="cart-empty">{t.cartSidebar.empty}</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" loading="lazy" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>{item.quantity} x {item.price} RSD</p>
                </div>
                <button className="cart-item-remove-btn" onClick={() => onRemove(item.id)}>
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>{t.cartSidebar.total}</span>
              <span>{cart.reduce((total, item) => total + item.price * item.quantity, 0)} RSD</span>
            </div>
            <button className="btn btn-primary auth-submit" onClick={handleCheckoutClick}>{t.cartSidebar.checkoutBtn}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartSidebar;