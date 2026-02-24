import React from 'react';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import './CartPage.css';

const CartPage = ({ cart, onRemove, onCheckout, setActivePage }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-page-container empty-cart">
        <h2>Vaša korpa je prazna.</h2>
        <p>Vratite se na prodavnicu i dodajte neke proizvode.</p>
        <button className="btn btn-primary" onClick={() => setActivePage('products')}>
          <FiArrowLeft /> Nazad na prodavnicu
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1 className="cart-title">Vaša Korpa</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th colSpan="2">Proizvod</th>
            <th>Cena</th>
            <th>Količina</th>
            <th>Ukupno</th>
            <th>Ukloni</th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} className="cart-table-row">
              <td className="cart-table-image">
                <img src={item.image} alt={item.name} />
              </td>
              <td className="cart-table-name">{item.name}</td>
              <td>{item.price} RSD</td>
              <td>{item.quantity}</td>
              <td>{item.price * item.quantity} RSD</td>
              <td>
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
          <h2>Ukupno za plaćanje:</h2>
          <span className="total-price">{total} RSD</span>
        </div>
        <div className="cart-summary-actions">
          <button className="btn btn-secondary" onClick={() => setActivePage('products')}>
            Nastavi kupovinu
          </button>
          <button className="btn btn-primary" onClick={onCheckout}>
            Završi kupovinu
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;