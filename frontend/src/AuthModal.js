import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';

function AuthModal({ isOpen, onClose, API_URL, setCurrentUser, initialMode = 'signin', t }) {
  const [authMode, setAuthMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Unos podataka, 2: Unos koda
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Resetuj stanje kada se modal otvori
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setVerificationCode('');
      setAuthMessage('');
      setAuthMode(initialMode);
      setUsername('');
      setPassword('');
      setEmail('');
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage('');
    setIsLoading(true);

    // --- KORAK 2: VERIFIKACIJA KODA (Samo za login) ---
    if (authMode === 'signin' && step === 2) {
      try {
        const response = await fetch(`${API_URL}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, code: verificationCode }),
        });
        const data = await response.json();

        if (!response.ok) {
          setAuthMessage(`Greška: ${data.message}`);
          return;
        }

        setAuthMessage(`Dobrodošli, ${data.username}!`);
        setCurrentUser(data.username);
        setTimeout(onClose, 1500);
      } catch (error) {
        setAuthMessage('Greška na serveru.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // --- KORAK 1: SLANJE PODATAKA ---
    
    let endpoint = '/login';
    let body = { username, password };

    if (authMode === 'signup') {
      endpoint = '/register';
      body = { username, password, email };
    } else if (authMode === 'forgot') {
      endpoint = '/forgot-password';
      body = { email };
    }

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

      if (authMode === 'forgot') {
        setAuthMessage(data.message);
        // Ne zatvaramo odmah da korisnik pročita poruku
      } else if (authMode === 'signin') {
        // Umesto logovanja, prelazimo na korak 2
        setAuthMessage(data.message || 'Verifikacioni kod je poslat na vaš email.');
        setStep(2);
      } else {
        setAuthMessage(data.message);
        setTimeout(onClose, 2000);
      }
    } catch (error) {
      console.error('Greška:', error);
      setAuthMessage('Greška na serveru.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><FiX /></button>
        
        <h2 className="modal-title">
          {authMode === 'signin' ? t.auth.welcomeBack : 
           authMode === 'signup' ? t.auth.createAccount : "Resetovanje lozinke"}
        </h2>
        {authMessage && <p className={`auth-message ${authMessage.startsWith('Greška') ? 'error' : 'success'}`}>{authMessage}</p>}
        
        <form onSubmit={handleAuthSubmit} className="auth-form">
          {step === 1 ? (
            <>
              {authMode !== 'forgot' && (
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input type="text" placeholder={t.auth.username} className="auth-input" value={username} onChange={(e) => { setUsername(e.target.value); setAuthMessage(''); }} required />
                </div>
              )}
              
              {authMode !== 'forgot' && (
                <div className="input-group">
                  <FiLock className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={t.auth.password} 
                    className="auth-input password-input" 
                    value={password} 
                    onChange={(e) => { setPassword(e.target.value); setAuthMessage(''); }} 
                    required 
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              )}
              
              {(authMode === 'signup' || authMode === 'forgot') && 
                <div className="input-group">
                  <FiMail className="input-icon" />
                  <input type="email" placeholder={t.auth.email} className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value); setAuthMessage(''); }} required />
                </div>}
            </>
          ) : (
            <div className="input-group">
              <FiLock className="input-icon" />
              <input 
                type="text" 
                placeholder="Unesite 6-cifreni kod" 
                className="auth-input" 
                value={verificationCode} 
                onChange={(e) => { setVerificationCode(e.target.value); setAuthMessage(''); }} 
                required 
                autoFocus
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner" style={{width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></span> Obrada...
              </span>
            ) : (step === 2 ? 'Potvrdi kod' : 
                 authMode === 'signin' ? t.auth.loginBtn : 
                 authMode === 'signup' ? t.auth.registerBtn : "Resetuj lozinku")}
          </button>
        </form>

        <div className="auth-switch">
          {step === 2 && authMode === 'signin' ? (
            <p><span onClick={() => { setStep(1); setAuthMessage(''); }}>Nazad na prijavu</span></p>
          ) : authMode === 'signin' ? (
            <>
              <p>{t.auth.noAccount} <span onClick={() => setAuthMode('signup')}>{t.auth.registerHere}</span></p>
              <p className="forgot-password-link"><span onClick={() => setAuthMode('forgot')} style={{cursor: 'pointer'}}>Zaboravili ste lozinku?</span></p>
            </>
          ) : (
            <p>{t.auth.hasAccount} <span onClick={() => setAuthMode('signin')}>{t.auth.loginHere}</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;