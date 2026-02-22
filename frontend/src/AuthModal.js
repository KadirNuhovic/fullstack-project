import React, { useState } from 'react';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, API_URL, setCurrentUser, initialMode = 'signin' }) {
  const [authMode, setAuthMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage('');

    const endpoint = authMode === 'signup' ? '/register' : '/login';
    const body = authMode === 'signup' 
      ? { username, password, email } 
      : { username, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setAuthMessage(`Greška: ${data.message}`);
        return;
      }

      if (authMode === 'signin') {
        setAuthMessage(`Dobrodošli, ${data.username}!`);
        setCurrentUser(data.username);
        setTimeout(onClose, 1500);
      } else {
        setAuthMessage(data.message);
        setTimeout(onClose, 2000);
      }
    } catch (error) {
      console.error('Greška:', error);
      setAuthMessage('Greška na serveru.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2>{authMode === 'signin' ? 'Dobrodošli nazad' : 'Napravi nalog'}</h2>
        {authMessage && <p className={`auth-message ${authMessage.startsWith('Greška') ? 'error' : 'success'}`}>{authMessage}</p>}
        
        <form onSubmit={handleAuthSubmit}>
          <input type="text" placeholder="Korisničko ime" className="auth-input" value={username} onChange={(e) => { setUsername(e.target.value); setAuthMessage(''); }} required />
          <input type="password" placeholder="Lozinka" className="auth-input" value={password} onChange={(e) => { setPassword(e.target.value); setAuthMessage(''); }} required />
          {authMode === 'signup' && 
            <input type="email" placeholder="Email adresa" className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value); setAuthMessage(''); }} required />}
          
          <button type="submit" className="btn btn-primary auth-submit">
            {authMode === 'signin' ? 'Prijavi se' : 'Registruj se'}
          </button>
        </form>

        <div className="auth-switch">
          {authMode === 'signin' ? (
            <p>Nemaš nalog? <span onClick={() => setAuthMode('signup')}>Registruj se ovde</span></p>
          ) : (
            <p>Već imaš nalog? <span onClick={() => setAuthMode('signin')}>Prijavi se</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;