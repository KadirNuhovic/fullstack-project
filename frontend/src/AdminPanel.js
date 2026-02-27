import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ API_URL, setProducts }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Stanja za porudžbine
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'users' ili 'messages'

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // Tvoja tajna šifra
      setIsAuthenticated(true);
    } else {
      alert('Pogrešna lozinka!');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'messages') fetchMessages();
    }
  }, [isAuthenticated, activeTab]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Greška pri učitavanju porudžbina:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Greška pri učitavanju korisnika:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/contact`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Greška pri učitavanju poruka:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-panel login-mode">
        <h2 className="section-title">Admin Pristup</h2>
        <form onSubmit={handleLogin} className="admin-form">
          <input 
            type="password" 
            className="admin-input" 
            placeholder="Unesite lozinku" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className="btn btn-primary btn-block">Uloguj se</button>
        </form>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title">Admin Panel</h1>
      
      <div className="admin-tabs">
        <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('orders')}>Porudžbine</button>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')}>Korisnici</button>
        <button className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('messages')}>Poruke</button>
      </div>

      {activeTab === 'orders' && (
        <div className="orders-container">
          {orders.length === 0 ? <p>Nema porudžbina.</p> : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kupac</th>
                    <th>Email / Telefon</th>
                    <th>Adresa</th>
                    <th>Korpa</th>
                    <th>Ukupno</th>
                    <th>Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.customer_email}<br/>{order.customer_phone}</td>
                      <td>{order.customer_address}<br/>{order.customer_city}, {order.customer_postal_code}</td>
                      <td>
                        <ul style={{listStyle:'none', padding:0, fontSize:'0.9rem'}}>
                          {order.items.map((item, i) => (
                            <li key={i}>{item.name} x{item.quantity}</li>
                          ))}
                        </ul>
                      </td>
                      <td style={{fontWeight:'bold', color:'#61dafb'}}>{order.total_price} RSD</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="orders-container">
          {users.length === 0 ? <p>Nema registrovanih korisnika.</p> : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Korisničko ime</th>
                    <th>Email</th>
                    <th>Poslednja Prijava</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Nikada'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="orders-container">
          {messages.length === 0 ? <p>Nema novih poruka.</p> : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Ime</th>
                    <th>Email</th>
                    <th>Poruka</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id}>
                      <td>{new Date(msg.created_at).toLocaleString()}</td>
                      <td>{msg.name}</td>
                      <td>{msg.email}</td>
                      <td>{msg.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;