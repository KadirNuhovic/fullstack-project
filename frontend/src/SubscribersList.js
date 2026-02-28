import React, { useState, useEffect } from 'react';
import './SubscribersList.css';

function SubscribersList({ API_URL }) {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, [API_URL]);

  const downloadCSV = () => {
    const header = "ID,Email Adresa";
    const rows = subscribers.map(sub => `${sub.id},${sub.email}`).join("\n");
    const csvContent = `${header}\n${rows}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pretplatnici.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  if (loading) return <div className="subscribers-container"><p>Učitavanje...</p></div>;
  if (error) return <div className="subscribers-container"><p className="error-text">{error}</p></div>;

  return (
    <div className="subscribers-container">
      <h2 className="section-title">Lista Pretplatnika ({subscribers.length})</h2>
      <button className="btn btn-primary download-btn" onClick={downloadCSV}>Preuzmi Excel (CSV)</button>
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