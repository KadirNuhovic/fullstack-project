import React from 'react';

const ProductList = ({ rezultati, searchTerm, t, openProductDetail, handleAddToCart }) => {
  return (
    <>
      <h2 className="section-title">{t.hero.cta} ({rezultati.length})</h2>
      {rezultati.length > 0 ? (
        <div className="product-grid">
          {rezultati.map((proizvod) => (
            <div key={proizvod.id} className="product-card" onClick={() => openProductDetail(proizvod)}>
              <div className="product-image-wrapper">
                <img src={proizvod.image} alt={proizvod.name} className="product-image" loading="lazy" />
              </div>
              <div className="product-info">
                <h3>{proizvod.name}</h3>
                <span className="product-price">{proizvod.price} RSD</span>
                <button className="btn-add-cart" onClick={(e) => { e.stopPropagation(); handleAddToCart(proizvod.id, 1); }}>
                  {t.productDetail.addToCart}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-results">Nema rezultata za "{searchTerm}"</p>
      )}
    </>
  );
};

export default ProductList;