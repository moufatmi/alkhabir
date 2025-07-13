import React from "react";
import Header from "./Header";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { hasActiveSubscription } from "../services/paypalService";
import { useUserRole } from "../hooks/useUserRole";

const ClientDashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const isSubscribed = hasActiveSubscription();
  const { role } = useUserRole(user ?? null);

  return (
    <>
      <Header />
      <div style={{ maxWidth: 600, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 16, color: '#1e293b' }}>لوحة تحكم العميل</h1>
        {user ? (
          <div style={{ marginBottom: 24 }}>
            <div><strong>البريد الإلكتروني:</strong> {user.email}</div>
            <div><strong>معرّف المستخدم:</strong> {user.uid}</div>
            <div><strong>الدور:</strong> {role === 'admin' ? 'مدير' : 'عميل'}</div>
          </div>
        ) : (
          <div style={{ marginBottom: 24, color: '#f00' }}>لم يتم تسجيل الدخول</div>
        )}
        <div style={{ marginBottom: 24 }}>
          <strong>حالة الاشتراك:</strong> {isSubscribed ? (
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>نشط ✅</span>
          ) : (
            <span style={{ color: '#f59e42', fontWeight: 'bold' }}>غير نشط ❌</span>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <button
            style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => window.location.href = '/subscription'}
          >
            إدارة الاشتراك
          </button>
        </div>
        <div style={{ color: '#64748b', fontSize: 14 }}>
          إذا واجهت أي مشكلة، يرجى التواصل مع المطور Moussab Fatmi.
        </div>
      </div>
    </>
  );
};
export default ClientDashboard;
