import React, { useState, useEffect } from 'react';

function UserProfile({ currentUser, API_URL, t }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetch(`${API_URL}/my-orders/${currentUser}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [currentUser, API_URL]);

  if (!currentUser) return <div className="page-container"><p>Morate biti prijavljeni.</p></div>;

  return (
    <div className="page-container">
      <div className="hero-section" style={{minHeight: '30vh', padding: '4rem 2rem'}}>
        <h1>Zdravo, <span className="highlight">{currentUser}</span></h1>
        <p className="subtitle">Dobrodošli na vaš profil.</p>
      </div>

      <div className="content-area">
        <h2 className="section-title">Vaša Istorija Porudžbina</h2>
        
        {loading ? (
          <p style={{textAlign: 'center'}}>Učitavanje...</p>
        ) : orders.length === 0 ? (
          <div className="empty-cart-container">
            <p>Još uvek nemate nijednu porudžbinu.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Iznos</th>
                  <th>Detalji</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('sr-RS')}</td>
                    <td>
                      <span style={{
                        padding: '5px 10px', 
                        borderRadius: '12px', 
                        background: order.status === 'Isporučeno' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: order.status === 'Isporučeno' ? '#2ecc71' : 'white'
                      }}>
                        {order.status || 'Na čekanju'}
                      </span>
                    </td>
                    <td>{order.total_price} RSD</td>
                    <td style={{fontSize: '0.9rem', color: '#aaa'}}>
                      {order.items && Array.isArray(order.items) ? order.items.map(i => i.name).join(', ') : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;