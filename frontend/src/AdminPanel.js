import React, { useState, useEffect } from 'react';

// Komponenta za Admin Panel
function AdminPanel({ API_URL, setProducts: setGlobalProducts }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProductsState] = useState([]); // Lokalno stanje za proizvode u admin panelu

  // Učitavanje svih podataka pri prvom renderovanju
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, messagesRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/orders`),
          fetch(`${API_URL}/contact`),
          fetch(`${API_URL}/products`)
        ]);
        const ordersData = await ordersRes.json();
        const messagesData = await messagesRes.json();
        const productsData = await productsRes.json();
        
        setOrders(ordersData);
        setMessages(messagesData);
        setProductsState(productsData);
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

  return (
    <div className="admin-panel">
      <h1 className="section-title">Admin Panel</h1>
      <div className="admin-tabs">
        <button onClick={() => setActiveTab('orders')} className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}>Porudžbine ({orders.length})</button>
        <button onClick={() => setActiveTab('messages')} className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}>Poruke ({messages.length})</button>
        <button onClick={() => setActiveTab('products')} className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}>Proizvodi ({products.length})</button>
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
                  <td>{new Date(order.created_at).toLocaleDateString('sr-RS')}</td>
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
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Slika</th>
                <th>Naziv</th>
                <th>Cena</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><img src={p.image} alt={p.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /></td>
                  <td>{p.name}</td>
                  <td>{p.price} RSD</td>
                  <td>
                    <button onClick={() => deleteProduct(p.id)} className="btn-icon" style={{color: 'red', fontSize: '1.2rem'}}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;