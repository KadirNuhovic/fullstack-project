import React, { useState, useEffect } from 'react';

function AdminPanel({ API_URL, setProducts: setGlobalProducts, currentUser }) {
  // Stanje za autentifikaciju - token je dokaz da je korisnik ulogovan
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [userRole, setUserRole] = useState(localStorage.getItem('adminRole'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProductsState] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', category: 'Ostalo', stock: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [authError, setAuthError] = useState('');

  // Helper za dodavanje tokena u zahteve
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  useEffect(() => {
    // Ako nema tokena, ne radimo ništa
    if (!token) return;

    // Učitavamo podatke samo ako postoji token
    const fetchData = async () => {
      try {
        const [ordersRes, messagesRes, productsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/orders`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/contact`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/products`), // Proizvodi su javni, ne treba token
          fetch(`${API_URL}/categories`) // Kategorije su javne
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
  }, [API_URL, token]); // Ponovo učitaj podatke ako se token promeni

  const deleteOrder = async (id) => {
    if (!window.confirm(`Da li ste sigurni da želite da obrišete porudžbinu #${id}?`)) return;
    try {
      await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setOrders(orders.filter(o => o.id !== id));
    } catch (err) { console.error(err); }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
      }
    } catch (err) { console.error(err); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete ovu poruku?")) return;
    try {
      await fetch(`${API_URL}/contact/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err) { console.error(err); }
  };

  const deleteAllMessages = async () => {
    if (!window.confirm("PAŽNJA: Da li ste sigurni da želite da obrišete SVE poruke? Ovo se ne može poništiti!")) return;
    try {
      await fetch(`${API_URL}/contact`, { method: 'DELETE', headers: getAuthHeaders() });
      setMessages([]);
    } catch (err) { console.error(err); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete ovaj proizvod?")) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        const updatedProducts = products.filter(p => p.id !== id);
        setProductsState(updatedProducts);
        setGlobalProducts(updatedProducts);
      }
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditFormData(product);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
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
        setEditingProductId(null);
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
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newProduct,
          price: parseInt(newProduct.price) || 0,
          stock: parseInt(newProduct.stock) || 0
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

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newCategory })
      });
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
      setNewCategory('');
    } catch (err) { console.error(err); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Obriši ovu kategoriju?")) return;
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (err) { console.error(err); }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        // Sačuvaj token i rolu u localStorage da preživi refresh
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminRole', data.role);
        setToken(data.token);
        setUserRole(data.role);
      } else {
        setAuthError(data.message || 'Pogrešni podaci.');
      }
    } catch (error) {
      setAuthError('Greška pri povezivanju sa serverom.');
    }
  };

  // Ako nema tokena, prikaži login formu
  if (!token) {
    return (
      <div className="admin-panel login-mode">
        <h2 className="section-title">Admin Pristup</h2>
        <form onSubmit={handleAdminLogin} className="admin-form">
          {authError && <p style={{ color: '#ff4757', textAlign: 'center' }}>{authError}</p>}
          <input 
            type="text" 
            placeholder="Korisničko ime" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="admin-input"
            autoFocus
          />
          <input 
            type="password" 
            placeholder="Unesite lozinku" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="admin-input"
          />
          <button type="submit" className="btn btn-primary btn-block">Pristupi</button>
        </form>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    setToken(null);
    setUserRole(null);
  };

  return (
    <div className="admin-panel">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 className="section-title" style={{textAlign: 'left', marginBottom: '1rem'}}>Admin Panel</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Odjavi se</button>
      </div>
      <div className="admin-tabs">
        <button onClick={() => setActiveTab('orders')} className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}>Porudžbine ({orders.length})</button>
        <button onClick={() => setActiveTab('messages')} className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}>Poruke ({messages.length})</button>
        <button onClick={() => setActiveTab('products')} className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}>Proizvodi ({products.length})</button>
        <button onClick={() => setActiveTab('categories')} className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}>Kategorije ({categories.length})</button>
      </div>

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
                    {userRole === 'superadmin' && (
                      <button onClick={() => deleteOrder(order.id)} className="btn-icon" style={{color: 'red', fontSize: '1.2rem'}} title="Obriši">🗑️</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'messages' && (
        <div>
          {userRole === 'superadmin' && (
            <button onClick={deleteAllMessages} className="btn btn-danger" style={{marginBottom: '20px'}}>Obriši sve poruke</button>
          )}
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
                      {userRole === 'superadmin' && (
                        <button onClick={() => deleteMessage(msg.id)} className="btn-icon" style={{color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          {userRole === 'superadmin' && (
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
          )}

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
                    <tr key={p.id} className="edit-row">
                      <td>{p.id}</td>
                      <td><img src={editFormData.image} alt={editFormData.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /></td>
                      <td><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="admin-input" /></td>
                      <td><input type="number" name="price" value={editFormData.price} onChange={handleEditFormChange} className="admin-input" /></td>
                      <td><input type="number" name="stock" value={editFormData.stock} onChange={handleEditFormChange} className="admin-input" /></td>
                      <td>
                        <button onClick={() => handleUpdateProduct(p.id)} className="btn-icon" title="Sačuvaj">💾</button>
                        <button onClick={() => setEditingProductId(null)} className="btn-icon" title="Otkaži">❌</button>
                      </td>
                    </tr>
                  ) : (
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
                        {userRole === 'superadmin' && (
                          <>
                            <button onClick={() => handleEditClick(p)} className="btn-icon" title="Izmeni">✏️</button>
                            <button onClick={() => deleteProduct(p.id)} className="btn-icon" title="Obriši" style={{color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          {userRole === 'superadmin' && (
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
          )}
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
                      {userRole === 'superadmin' && (
                        <button onClick={() => deleteCategory(c.id)} className="btn-icon" style={{color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                      )}
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