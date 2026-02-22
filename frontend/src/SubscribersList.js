import React, { useState, useEffect } from 'react';
import './SubscribersList.css';

function SubscribersList({ API_URL }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin') { // OVDE POSTAVI SVOJU LOZINKU
      setIsAuthenticated(true);
    } else {
      alert('Pogrešna lozinka!');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return; // Ne učitavaj dok se ne uloguješ

    const fetchSubscribers = async () => {
      try {
        const response = await fetch(`${API_URL}/subscribers`);
        if (!response.ok) {
          throw new Error('Greška pri učitavanju podataka');
        }
        const data = await response.json();
        setSubscribers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, [API_URL, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="subscribers-container">
        <h2 className="section-title">Zaštićen Pristup</h2>
        <form onSubmit={handleLogin} className="password-form">
          <input
            type="password"
            placeholder="Unesite lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
          />
          <button type="submit" className="btn btn-primary">Pristupi</button>
        </form>
      </div>
    );
  }
  
  if (loading) return <div className="subscribers-container"><p>Učitavanje...</p></div>;
  if (error) return <div className="subscribers-container"><p className="error-text">{error}</p></div>;

  return (
    <div className="subscribers-container">
      <h2 className="section-title">Lista Pretplatnika ({subscribers.length})</h2>
      <div className="table-wrapper">
        <table className="subscribers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email Adresa</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.id}</td>
                <td>{sub.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubscribersList;