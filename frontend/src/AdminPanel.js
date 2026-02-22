import React, { useState } from 'react';
import './AdminPanel.css';

function AdminPanel({ API_URL, setProducts }) {
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          price: parseInt(newProductPrice),
          image: newProductImage
        }),
      });
      
      if (response.ok) {
        alert('Proizvod uspešno dodat!');
        setNewProductName('');
        setNewProductPrice('');
        setNewProductImage('');
        // Osveži listu proizvoda
        const productsRes = await fetch(`${API_URL}/products`);
        const productsData = await productsRes.json();
        setProducts(productsData);
      } else {
        alert('Greška pri dodavanju proizvoda.');
      }
    } catch (error) {
      console.error('Greška:', error);
    }
  };

  return (
    <div className="admin-panel">
      <h2 className="section-title">Admin Panel - Dodaj Proizvod</h2>
      <form className="admin-form" onSubmit={handleAddProduct}>
        <div className="form-group">
          <label>Naziv Proizvoda</label>
          <input type="text" className="admin-input" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="npr. Suve Jagode" required />
        </div>
        <div className="form-group">
          <label>Cena (RSD)</label>
          <input type="number" className="admin-input" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} placeholder="npr. 1200" required />
        </div>
        <div className="form-group">
          <label>URL Slike</label>
          <input type="text" className="admin-input" value={newProductImage} onChange={(e) => setNewProductImage(e.target.value)} placeholder="https://..." required />
        </div>
        <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}>Dodaj Proizvod</button>
      </form>
    </div>
  );
}

export default AdminPanel;