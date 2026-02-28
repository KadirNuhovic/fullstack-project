import React from 'react';

const ProductList = ({ rezultati, searchTerm, t, openProductDetail, handleAddToCart, selectedCategory, setSelectedCategory, sortOrder, setSortOrder, categories }) => {
  return (
    <>
      <h2 className="section-title">{t.hero.cta} ({rezultati.length})</h2>
      
      {/* Filteri i Sortiranje */}
      <div className="filter-container">
        <div className="filter-group">
          <label>Kategorija:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
            <option value="Sve">Sve</option>
            {categories && categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Sortiraj po:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="filter-select">
            <option value="default">Podrazumevano</option>
            <option value="price-asc">Cena: Najniža prvo</option>
            <option value="price-desc">Cena: Najviša prvo</option>
          </select>
        </div>
      </div>

      {rezultati.length > 0 ? (
        <div className="product-grid">
          {rezultati.map((proizvod) => (
            <div key={proizvod.id} className={`product-card ${proizvod.stock === 0 ? 'sold-out' : ''}`} onClick={() => proizvod.stock > 0 && openProductDetail(proizvod)}>
              <div className="product-image-wrapper">
                <img src={proizvod.image} alt={proizvod.name} className="product-image" loading="lazy" />
              </div>
              <div className="product-info">
                <h3>{proizvod.name}</h3>
                <span className="product-price">{proizvod.price} RSD</span>
                <button 
                  className="btn-add-cart" 
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(proizvod.id, 1); }}
                  disabled={proizvod.stock === 0}
                >
                  {proizvod.stock > 0 ? t.productDetail.addToCart : 'Rasprodato'}
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