import React, { useState } from 'react';
import { FiArrowLeft, FiMinus, FiPlus, FiStar } from 'react-icons/fi';
import './ProductDetail.css';

function ProductDetail({ product, onClose, onAddToCart, t }) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([
    { id: 1, user: 'Marko P.', text: 'Odličan kvalitet, sve preporuke!', rating: 5 },
    { id: 2, user: 'Jelena M.', text: 'Brza isporuka, voće je sveže.', rating: 4 },
  ]);
  const [newReview, setNewReview] = useState('');

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    setReviews([...reviews, { id: Date.now(), user: 'Vi', text: newReview, rating: 5 }]);
    setNewReview('');
  };

  return (
    <div className="product-detail-view">
      <button className="back-btn" onClick={onClose}>
        <FiArrowLeft /> {t.productDetail.back}
      </button>

      <div className="detail-container">
        <div className="detail-image-wrapper">
          {product.image ? (
            <img src={product.image} alt={product.name} className="detail-image fade-in" />
          ) : (
            <div className="product-image-placeholder"><span>{product.name.charAt(0)}</span></div>
          )}
        </div>
        
        <div className="detail-info">
          <h1>{product.name}</h1>
          <span className="detail-price">{product.price} RSD</span>
          <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '2rem' }}>
            Najkvalitetnije sušeno voće, pažljivo birano i pakovano da zadrži svu svežinu i ukus.
          </p>

          <div className="quantity-selector">
            <button className="qty-btn" onClick={() => handleQuantityChange(-1)}><FiMinus /></button>
            <span className="qty-value">{quantity} kg</span>
            <button className="qty-btn" onClick={() => handleQuantityChange(1)}><FiPlus /></button>
          </div>

          <button className="add-to-cart-large" onClick={() => onAddToCart(product.id, quantity)}>
            {t.productDetail.addToCart} - {(product.price * quantity)} RSD
          </button>
        </div>
      </div>

      <div className="reviews-section">
        <h3>{t.productDetail.reviews} ({reviews.length})</h3>
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <span className="review-user">{review.user}</span>
                <div className="review-stars">{[...Array(review.rating)].map((_, i) => <FiStar key={i} fill="#f1c40f" stroke="none" />)}</div>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
        </div>
        <form className="review-form" onSubmit={submitReview}>
          <textarea placeholder={t.productDetail.writeReview} value={newReview} onChange={(e) => setNewReview(e.target.value)} />
          <button type="submit" className="btn btn-primary">{t.productDetail.sendReview}</button>
        </form>
      </div>
    </div>
  );
}

export default ProductDetail;