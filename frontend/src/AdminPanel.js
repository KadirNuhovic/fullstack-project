import React, { useState, useEffect } from 'react';

// Komponenta za Admin Panel
function AdminPanel({ API_URL, setProducts: setGlobalProducts }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProductsState] = useState([]); // Lokalno stanje za proizvode u admin panelu
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', category: 'Ostalo', stock: '' });
  const [editingProductId, setEditingProductId] = useState(null); // ID proizvoda koji se menja
  const [editFormData, setEditFormData] = useState({}); // Podaci za formu izmene

  // Učitavanje svih podataka pri prvom renderovanju
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, messagesRes, productsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/orders`),
          fetch(`${API_URL}/contact`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`)
        ]);
        const ordersData = await ordersRes.json();
        const messagesData = await messagesRes.json();
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        
        setOrders(ordersData);
        setMessages(messagesData);
        setProductsState(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Greška pri učitavanju admin podataka:", error);
      }
    };
    fetchData();
  }, [API_URL]);

  // --- FUNKCIJE ZA PORUDŽBINE ---
  const deleteOrder = async (id) => {
    if (!window.confirm(`Da li ste sigurni da želite da obrišete porudžbinu #${id}?`)) return;
    try {
      await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      setOrders(orders.filter(o => o.id !== id));
    } catch (err) { console.error(err); }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);
    } catch (err) { console.error(err); }
  };

  // --- FUNKCIJE ZA PORUKE ---
  const deleteMessage = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete ovu poruku?")) return;
    try {
      await fetch(`${API_URL}/contact/${id}`, { method: 'DELETE' });
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err) { console.error(err); }
  };

  const deleteAllMessages = async () => {
    if (!window.confirm("PAŽNJA: Da li ste sigurni da želite da obrišete SVE poruke? Ovo se ne može poništiti!")) return;
    try {
      await fetch(`${API_URL}/contact`, { method: 'DELETE' });
      setMessages([]);
    } catch (err) { console.error(err); }
  };

  // --- FUNKCIJE ZA PROIZVODE ---
  const deleteProduct = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete ovaj proizvod?")) return;
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      const updatedProducts = products.filter(p => p.id !== id);
      setProductsState(updatedProducts);
      setGlobalProducts(updatedProducts); // Ažuriraj i globalno stanje
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditFormData(product);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          price: parseInt(editFormData.price, 10),
          stock: parseInt(editFormData.stock, 10)
        })
      });
      if (response.ok) {
        const { product: updatedProduct } = await response.json();
        const updatedProducts = products.map(p => p.id === id ? updatedProduct : p);
        setProductsState(updatedProducts);
        setGlobalProducts(updatedProducts);
        setEditingProductId(null); // Izlaz iz moda za izmenu
      } else {
        alert('Greška pri ažuriranju proizvoda.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseInt(newProduct.price),
          stock: parseInt(newProduct.stock)
        })
      });
      if (response.ok) {
        const productsRes = await fetch(`${API_URL}/products`);
        const productsData = await productsRes.json();
        setProductsState(productsData);
        setGlobalProducts(productsData);
        setNewProduct({ name: '', price: '', image: '', category: 'Ostalo', stock: '' });
        alert('Proizvod uspešno dodat!');
      } else {
        const data = await response.json();
        alert(`Greška: ${data.message || 'Proverite da li su svi podaci uneti ispravno.'}`);
      }
    } catch (err) { console.error(err); }
  };

  // --- FUNKCIJE ZA KATEGORIJE ---
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      });
      // Osveži listu
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
      setNewCategory('');
    } catch (err) { console.error(err); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Obriši ovu kategoriju?")) return;
    try {
      await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="admin-panel">
      <h1 className="section-title">Admin Panel</h1>
      <div className="admin-tabs">
        <button onClick={() => setActiveTab('orders')} className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}>Porudžbine ({orders.length})</button>
        <button onClick={() => setActiveTab('messages')} className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}>Poruke ({messages.length})</button>
        <button onClick={() => setActiveTab('products')} className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}>Proizvodi ({products.length})</button>
        <button onClick={() => setActiveTab('categories')} className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}>Kategorije ({categories.length})</button>
      </div>

      {/* --- TABELA PORUDŽBINA --- */}
      {activeTab === 'orders' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kupac</th>
                <th>Ukupno</th>
                <th>Status</th>
                <th>Datum</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}<br/><small>{order.customer_email}</small></td>
                  <td>{order.total_price} RSD</td>
                  <td>
                    <select 
                      value={order.status || 'Na čekanju'} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{background: '#333', color: 'white', border: '1px solid #555', padding: '5px', borderRadius: '5px'}}
                    >
                      <option value="Na čekanju">Na čekanju 🕒</option>
                      <option value="Poslato">Poslato 🚚</option>
                      <option value="Isporučeno">Isporučeno ✅</option>
                      <option value="Otkazano">Otkazano ❌</option>
                    </select>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString('sr-RS')}<br/>
                    <small>{new Date(order.created_at).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</small>
                  </td>
                  <td>
                    <button onClick={() => deleteOrder(order.id)} className="btn-icon" style={{color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TABELA PORUKA --- */}
      {activeTab === 'messages' && (
        <div>
          <button onClick={deleteAllMessages} className="btn btn-danger" style={{marginBottom: '20px'}}>Obriši sve poruke</button>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ime</th>
                  <th>Email</th>
                  <th>Poruka</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr key={msg.id}>
                    <td>{msg.name}</td>
                    <td>{msg.email}</td>
                    <td>{msg.message}</td>
                    <td>
                      <button onClick={() => deleteMessage(msg.id)} className="btn-icon" style={{color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TABELA PROIZVODA --- */}
      {activeTab === 'products' && (
        <div>
          <div className="admin-form-section">
            <h3 style={{marginBottom: '1rem'}}>Dodaj novi proizvod</h3>
            <form onSubmit={handleAddProduct} className="add-product-form">
              <input type="text" name="name" value={newProduct.name} onChange={handleNewProductChange} placeholder="Naziv proizvoda" required className="admin-input" />
              <input type="number" name="price" value={newProduct.price} onChange={handleNewProductChange} placeholder="Cena (RSD)" required className="admin-input" />
              <input type="number" name="stock" value={newProduct.stock} onChange={handleNewProductChange} placeholder="Količina na stanju" required className="admin-input" />
              <input type="text" name="image" value={newProduct.image} onChange={handleNewProductChange} placeholder="URL slike" required className="admin-input" />
              <select name="category" value={newProduct.category} onChange={handleNewProductChange} className="admin-input">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <button type="submit" className="btn btn-primary">Dodaj Proizvod</button>
            </form>
          </div>

          <div className="table-responsive" style={{marginTop: '2rem'}}>
            <table className="admin-table">
              <thead>
                  <tr>
                    <th>ID</th>
                    <th>Slika</th>
                    <th>Naziv</th>
                    <th>Cena</th>
                    <th>Na stanju</th>
                    <th>Akcije</th>
                  </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  editingProductId === p.id ? (
                    // Red za izmenu
                    <tr key={p.id} className="edit-row">
                      <td>{p.id}</td>
                      <td><img src={editFormData.image} alt={editFormData.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /></td>
                      <td><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="admin-input" /></td>
                      <td><input type="number" name="price" value={editFormData.price} onChange={handleEditFormChange} className="admin-input" /></td>
                      <td><input type="number" name="stock" value={editFormData.stock} onChange={handleEditFormChange} className="admin-input" /></td>
                      <td>
                        <button onClick={() => handleUpdateProduct(p.id)} className="btn-icon" title="Sačuvaj">💾</button>
                        <button onClick={handleCancelEdit} className="btn-icon" title="Otkaži">❌</button>
                      </td>
                    </tr>
                  ) : (
                    // Normalan red
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td><img src={p.image} alt={p.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /></td>
                      <td>{p.name}</td>
                      <td>{p.price} RSD</td>
                      <td>
                        <span style={{ color: p.stock <= 10 ? (p.stock === 0 ? '#ff4757' : '#e67e22') : 'inherit' }}>
                          {p.stock} kom
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleEditClick(p)} className="btn-icon" title="Izmeni">✏️</button>
                        <button onClick={() => deleteProduct(p.id)} className="btn-icon" title="Obriši" style={{color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TABELA KATEGORIJA --- */}
      {activeTab === 'categories' && (
        <div>
          <form onSubmit={addCategory} style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <input 
              type="text" 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)} 
              placeholder="Nova kategorija..." 
              className="admin-input"
              style={{flex: 1}}
            />
            <button type="submit" className="btn btn-primary">Dodaj</button>
          </form>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Naziv</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>
                      <button onClick={() => deleteCategory(c.id)} className="btn-icon" style={{color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;