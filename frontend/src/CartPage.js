import React from 'react';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import './CartPage.css';

const CartPage = ({ cart, onRemove, onCheckout, setActivePage, t }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-page-container empty-cart">
        <h2>{t.cart.emptyTitle}</h2>
        <p>{t.cart.emptyText}</p>
        <button className="btn btn-primary" onClick={() => setActivePage('products')}>
          <FiArrowLeft /> {t.cart.backBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1 className="cart-title">{t.cart.title}</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th colSpan="2">{t.cart.product}</th>
            <th>{t.cart.price}</th>
            <th>{t.cart.quantity}</th>
            <th>{t.cart.total}</th>
            <th>{t.cart.remove}</th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} className="cart-table-row">
              <td className="cart-table-image">
                <img src={item.image} alt={item.name} loading="lazy" />
              </td>
              <td className="cart-table-name" data-label={t.cart.product}>{item.name}</td>
              <td data-label={t.cart.price}>{item.price} RSD</td>
              <td data-label={t.cart.quantity}>{item.quantity}</td>
              <td data-label={t.cart.total}>{item.price * item.quantity} RSD</td>
              <td data-label={t.cart.remove}>
                <button className="cart-remove-btn" onClick={() => onRemove(item.id)}>
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <div className="cart-summary-total">
          <h2>{t.cart.totalPay}</h2>
          <span className="total-price">{total} RSD</span>
        </div>
        <div className="cart-summary-actions">
          <button className="btn btn-secondary" onClick={() => setActivePage('products')}>
            {t.cart.continue}
          </button>
          <button className="btn btn-primary" onClick={onCheckout}>
            {t.cart.checkout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;