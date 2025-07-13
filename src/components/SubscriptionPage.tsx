import React from "react";
import Header from "./Header";
import { hasActiveSubscription } from "../services/paypalService";
import PayPalSubscription from "./PayPalSubscription";

const SubscriptionPage: React.FC = () => {
  const isSubscribed = hasActiveSubscription();

  return (
    <>
      <Header />
      <div style={{ maxWidth: 600, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 16, color: '#1e293b' }}>صفحة الاشتراك</h1>
        <div style={{ marginBottom: 24 }}>
          <strong>حالة الاشتراك:</strong> {isSubscribed ? (
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>نشط ✅</span>
          ) : (
            <span style={{ color: '#f59e42', fontWeight: 'bold' }}>غير نشط ❌</span>
          )}
        </div>
        {!isSubscribed ? (
          <div style={{ marginBottom: 24 }}>
            <PayPalSubscription
              onSubscriptionSuccess={() => window.location.reload()}
              onSubscriptionError={() => alert('حدث خطأ أثناء الاشتراك. يرجى المحاولة لاحقاً.')}
            />
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
                إذا واجهت صعوبة في الدفع عبر بايبال أو ترغب بالدفع عبر بطاقة بنكية أو وسيلة أخرى، يمكنك التواصل مباشرة مع المطور للتفاوض حول طريقة الدفع.
              </p>
              <a
                href="https://wa.me/212698570282"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: '#25D366',
                  color: '#fff',
                  padding: '10px 24px',
                  borderRadius: 8,
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  fontSize: 16
                }}
              >
                تواصل مع المطور عبر واتساب
              </a>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 24, color: '#2563eb', fontWeight: 'bold' }}>
            أنت مشترك حالياً. شكراً لاستخدامك الخبير!
          </div>
        )}
        <div style={{ color: '#64748b', fontSize: 14 }}>
          إذا واجهت أي مشكلة في الاشتراك أو الدفع، يرجى التواصل مع المطور Moussab Fatmi.
        </div>
      </div>
    </>
  );
};
export default SubscriptionPage;
