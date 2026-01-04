import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { useUserRole } from "../hooks/useUserRole";

const Header: React.FC = () => {
  /* TEMPORARY DISABLE AUTH START */
  // const [user] = useAuthState(auth);
  // const { role } = useUserRole(user ?? null);
  const user = { uid: 'guest' }; // Mock user
  const role = 'guest';
  /* TEMPORARY DISABLE AUTH END */

  return (
    <header style={{ padding: "16px", background: "#f3f4f6", marginBottom: "24px" }}>
      <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
        {/* Logo and App Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.svg" alt="Scales of Justice" style={{ width: 48, height: 48 }} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', fontFamily: 'Aref Ruqaa, serif' }}>الخبير | Alkhabir</h1>
            <p style={{ fontSize: 14, color: '#475569', fontFamily: 'Aref Ruqaa, serif' }}>المساعد الذكي للقانوني</p>
          </div>
        </div>
        {/* Navigation */}
        <nav style={{ display: "flex", gap: "16px" }}>
          <Link to="/">الرئيسية</Link>
          {/* TEMPORARY DISABLE AUTH START - Hide Auth Buttons */
          /*
          {user ? (
            <>
              <Link to="/client">لوحة العميل</Link>
              <Link to="/subscription">الاشتراك</Link>
              <button onClick={() => auth.signOut()}>تسجيل الخروج</button>
              {role === 'admin' && (
                <button onClick={() => navigate('/moussabfatmimariem')} style={{ background: '#2563eb', color: '#fff', borderRadius: 6, padding: '4px 12px', fontWeight: 'bold' }}>
                  لوحة المدير
                </button>
              )}
            </>
          ) : (
            <button onClick={() => navigate("/login")}>دخول</button>
          )}
          */
          /* TEMPORARY DISABLE AUTH END */}
          {/* No admin panel link for clients */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
