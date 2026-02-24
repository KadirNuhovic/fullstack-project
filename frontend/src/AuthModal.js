import React, { useState } from 'react';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, API_URL, setCurrentUser, initialMode = 'signin', t }) {
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
        
        <h2>{authMode === 'signin' ? t.auth.welcomeBack : t.auth.createAccount}</h2>
        {authMessage && <p className={`auth-message ${authMessage.startsWith('Greška') ? 'error' : 'success'}`}>{authMessage}</p>}
        
        <form onSubmit={handleAuthSubmit}>
          <input type="text" placeholder={t.auth.username} className="auth-input" value={username} onChange={(e) => { setUsername(e.target.value); setAuthMessage(''); }} required />
          <input type="password" placeholder={t.auth.password} className="auth-input" value={password} onChange={(e) => { setPassword(e.target.value); setAuthMessage(''); }} required />
          {authMode === 'signup' && 
            <input type="email" placeholder={t.auth.email} className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value); setAuthMessage(''); }} required />}
          
          <button type="submit" className="btn btn-primary auth-submit">
            {authMode === 'signin' ? t.auth.loginBtn : t.auth.registerBtn}
          </button>
        </form>

        <div className="auth-switch">
          {authMode === 'signin' ? (
            <p>{t.auth.noAccount} <span onClick={() => setAuthMode('signup')}>{t.auth.registerHere}</span></p>
          ) : (
            <p>{t.auth.hasAccount} <span onClick={() => setAuthMode('signin')}>{t.auth.loginHere}</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;