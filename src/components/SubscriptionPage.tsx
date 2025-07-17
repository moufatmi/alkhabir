import React, { useState } from "react";
import Header from "./Header";
import { hasActiveSubscription } from "../services/paypalService";
import PayPalSubscription from "./PayPalSubscription";

const WHATSAPP_LINK = "https://wa.me/212698570282";

const userTypes = [
  { key: 'student', label: 'طالب', price: 50 },
  { key: 'judge', label: 'قاضٍ متدرب', price: 150 },
  { key: 'lawyer', label: 'محامٍ', price: 500 },
];

const SubscriptionPage: React.FC = () => {
  const isSubscribed = hasActiveSubscription();
  const [selectedType, setSelectedType] = useState<'student' | 'judge' | 'lawyer'>('student');

  let content;
  if (selectedType === 'student') {
    content = (
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
          للاستفادة من اشتراك الطلبة (50 درهم شهرياً)، يرجى التواصل معنا عبر واتساب للتحقق من وضعك كطالب والتفاوض حول طريقة الدفع.
        </p>
        <a
          href={WHATSAPP_LINK}
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
          تواصل عبر واتساب
        </a>
      </div>
    );
  } else if (selectedType === 'judge') {
    content = (
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
          للاستفادة من اشتراك القضاة المتدربين (150 درهم شهرياً)، يرجى التواصل معنا عبر واتساب للتحقق من وضعك كقاضٍ متدرب والتفاوض حول طريقة الدفع.
        </p>
        <a
          href={WHATSAPP_LINK}
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
          تواصل عبر واتساب
        </a>
      </div>
    );
  } else {
    // lawyer
    content = (
      <>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <PayPalSubscription
            onSubscriptionSuccess={() => window.location.reload()}
            onSubscriptionError={() => alert('حدث خطأ أثناء الاشتراك. يرجى المحاولة لاحقاً.')}
          />
        </div>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <p style={{ marginBottom: 12, color: '#1e293b', fontWeight: 'bold' }}>
            اشتراك المحامين (500 درهم شهرياً): يمكنك الدفع مباشرة عبر بايبال أو البطاقة البنكية، أو التواصل معنا عبر واتساب إذا واجهت صعوبة في الدفع.
          </p>
          <a
            href={WHATSAPP_LINK}
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
            تواصل عبر واتساب
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: 600, margin: '32px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 16, color: '#1e293b' }}>صفحة الاشتراك</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          {userTypes.map(type => (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key as 'student' | 'judge' | 'lawyer')}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: selectedType === type.key ? '2px solid #2563eb' : '1px solid #ddd',
                background: selectedType === type.key ? '#2563eb' : '#f3f4f6',
                color: selectedType === type.key ? '#fff' : '#1e293b',
                fontWeight: 'bold',
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              {type.label} ({type.price} درهم)
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 24 }}>
          <strong>حالة الاشتراك:</strong> {isSubscribed ? (
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>نشط ✅</span>
          ) : (
            <span style={{ color: '#f59e42', fontWeight: 'bold' }}>غير نشط ❌</span>
          )}
        </div>
        {!isSubscribed ? content : (
          <div style={{ marginBottom: 24, color: '#2563eb', fontWeight: 'bold' }}>
            أنت مشترك حالياً. شكراً لاستخدامك الخبير!
          </div>
        )}
        <div style={{ color: '#64748b', fontSize: 14 }}>
          إذا واجهت أي مشكلة في الاشتراك أو الدفع، يرجى التواصل مع الدعم الفني.
        </div>
      </div>
    </>
  );
};
export default SubscriptionPage;
