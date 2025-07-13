import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useUserRole } from "../hooks/useUserRole";

const Header: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { role } = useUserRole(user ?? null);

  return (
    <header style={{ padding: "16px", background: "#f3f4f6", marginBottom: "24px" }}>
      <nav style={{ display: "flex", gap: "16px" }}>
        <Link to="/">الرئيسية</Link>
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
        {/* No admin panel link for clients */}
      </nav>
    </header>
  );
};

export default Header;
