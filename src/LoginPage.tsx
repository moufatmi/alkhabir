import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('loggedIn') === 'true') {
      navigate('/app', { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'moussab' && password === 'moussab') {
      localStorage.setItem('loggedIn', 'true');
      navigate('/app', { replace: true });
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="login-container">
      <h1>تسجيل الدخول</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">دخول</button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="instructions">
        إذا أردت الاستفادة من خدمات منصة الخبير، المرجو التواصل مع المطور مصعب فاطمي
      </p>
      <div className="social-buttons">
        <a
          href="https://wa.me/+212698570282"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-button"
        >
          واتساب
        </a>
        <a
          href="https://www.instagram.com/moussabfatmi"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-button"
        >
          انستغرام
        </a>
      </div>
    </div>
  );
};

export default LoginPage;