import React, { useState } from "react";
import "./AuthForm.css";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
        {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {isLogin ? "دخول" : "تسجيل"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        style={{ background: "#e5e7eb", color: "#222", marginTop: "8px" }}
      >
        {isLogin ? "ماعندكش حساب؟ سجل" : "عندك حساب؟ دخول"}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default AuthForm;