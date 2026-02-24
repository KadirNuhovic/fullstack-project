import React, { useState } from 'react';
import './NewsletterSection.css';

function NewsletterSection({ API_URL, t }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        const response = await fetch(`${API_URL}/newsletter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        
        // Provera da li je odgovor JSON (da izbegnemo grešku ako server vrati 404 HTML)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (response.ok) {
                setSubscribed(true);
                setEmail('');
            } else {
                alert(data.message);
            }
        } else {
            // Ako server ne vrati JSON (npr. nisi restartovao server pa ruta ne postoji)
            if (response.status === 404) {
                alert("Greška: Server ne prepoznaje ovu akciju. Molim te RESTARTUJ backend server (node server.js).");
            } else {
                alert(`Greška na serveru (Status: ${response.status}).`);
            }
        }
      } catch (error) {
        console.error('Greška:', error);
        alert('Nije moguće povezati se sa serverom. Proveri da li je backend uključen.');
      }
    }
  };

  return (
    <div className="newsletter-section">
      <div className="newsletter-content">
        {subscribed ? (
          <div className="newsletter-success">
            <h3>{t.newsletter.successTitle}</h3>
            <p>{t.newsletter.successText}</p>
          </div>
        ) : (
          <>
            <h2>{t.newsletter.title}</h2>
            <p>{t.newsletter.text}</p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder={t.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">{t.newsletter.btn}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default NewsletterSection;