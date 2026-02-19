import React, { useState } from "react";
import "./AuthForm.css";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle, isAdmin } = useAuth();
  const navigate = useNavigate();
  // We can keep the useEffect as a fallback for auto-redirects when visiting /login while already authenticated
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/moussabfatmimariem');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });

        // Check admin status immediately after login to avoid React state race conditions
        // We import authService dynamically or use the context if we trust it updated (we don't for immediate nav)
        // But better: use the service directly here for the decision
        const { authService } = await import('../services/auth');
        const adminStatus = await authService.isAdmin();

        if (adminStatus) {
          navigate('/moussabfatmimariem');
        } else {
          navigate('/client');
        }
      } else {
        await register({ email, password, name });
        navigate('/client'); // New registrations are always clients
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "فشل تسجيل الدخول/التسجيل");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Redirect logic for Google is slightly different as it might be a redirect flow
      // But if it's a popup/seamless flow:
      if (isAdmin) {
        navigate('/moussabfatmimariem');
      } else {
        // navigate('/client'); // default behavior
      }
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول عبر Google");
    }
  };

  return (
    <div className="auth-form-container">
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
        {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
      </h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={loading}
          />
        )}
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "جاري المعالجة..." : (isLogin ? "دخول" : "تسجيل")}
        </button>
      </form>

      <div className="divider">أو</div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="google-btn"
        disabled={loading}
      >
        تسجيل الدخول عبر Google
      </button>

      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        style={{ background: "#e5e7eb", color: "#222", marginTop: "16px" }}
        disabled={loading}
      >
        {isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ دخول"}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default AuthForm;
