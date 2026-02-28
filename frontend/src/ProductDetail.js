import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiMinus, FiPlus, FiStar } from 'react-icons/fi';
import './ProductDetail.css';

function ProductDetail({ product, onClose, onAddToCart, t, API_URL, currentUser, onLogin }) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);

  // Učitavanje recenzija iz baze
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/products/${product.id}/reviews`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Greška pri učitavanju recenzija:", error);
      }
    };
    fetchReviews();
  }, [product.id, API_URL]);

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, Math.min(prev + amount, product.stock)));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    try {
      const response = await fetch(`${API_URL}/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, rating, text: newReview }),
      });
      if (response.ok) {
        // Osveži listu recenzija
        const newReviewData = { id: Date.now(), username: currentUser, rating, text: newReview };
        setReviews([newReviewData, ...reviews]);
        setNewReview('');
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Došlo je do greške pri slanju recenzije.");
      }
    } catch (error) {
      console.error("Greška pri slanju recenzije:", error);
      alert("Greška u komunikaciji sa serverom.");
    }
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
          
          <p style={{ color: product.stock > 10 ? '#2ecc71' : '#e67e22', fontWeight: 'bold', marginBottom: '2rem' }}>
            {product.stock > 0 ? `Na stanju: ${product.stock} kom` : 'Rasprodato'}
          </p>

          {product.stock > 0 && (
            <div className="quantity-selector">
              <button className="qty-btn" onClick={() => handleQuantityChange(-1)}><FiMinus /></button>
              <span className="qty-value">{quantity} kg</span>
              <button className="qty-btn" onClick={() => handleQuantityChange(1)}><FiPlus /></button>
            </div>
          )}

          <button 
            className="add-to-cart-large" 
            onClick={() => onAddToCart(product.id, quantity)}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? `${t.productDetail.addToCart} - ${(product.price * quantity)} RSD` : 'Rasprodato'}
          </button>
        </div>
      </div>

      <div className="reviews-section">
        <h3>{t.productDetail.reviews} ({reviews.length})</h3>
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <span className="review-user">{review.username}</span>
                <div className="review-stars">{[...Array(review.rating)].map((_, i) => <FiStar key={i} fill="#f1c40f" stroke="none" />)}</div>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
        </div>
        
        {currentUser ? (
          <form className="review-form" onSubmit={submitReview}>
            <div className="rating-selector">
              <span>Ocena: </span>
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar 
                  key={star} 
                  fill={star <= rating ? "#f1c40f" : "none"} 
                  stroke={star <= rating ? "none" : "currentColor"}
                  onClick={() => setRating(star)}
                  style={{ cursor: 'pointer', width: '24px', height: '24px' }}
                />
              ))}
            </div>
            <textarea placeholder={t.productDetail.writeReview} value={newReview} onChange={(e) => setNewReview(e.target.value)} />
            <button type="submit" className="btn btn-primary">{t.productDetail.sendReview}</button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>{t.productDetail.loginToReview} <button className="btn-link" onClick={onLogin} style={{background:'none', border:'none', color:'#61dafb', cursor:'pointer', textDecoration:'underline', fontSize:'1rem'}}>Prijavi se</button></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;