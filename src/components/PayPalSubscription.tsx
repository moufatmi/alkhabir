import React, { useEffect, useRef } from 'react';
import { SubscriptionPlan, saveSubscription } from '../services/paypalService';

interface PayPalSubscriptionProps {
  plan: SubscriptionPlan;
  onSubscriptionSuccess: (subscriptionId: string) => void;
  onSubscriptionError: (error: string) => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalSubscription: React.FC<PayPalSubscriptionProps> = ({
  plan,
  onSubscriptionSuccess,
  onSubscriptionError
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load PayPal SDK
    // TODO: Ideally, move SDK loading to a higher level or use a library like @paypal/react-paypal-js
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AUd2qUQhWNiSbJn5wNJWOgNmfYhZMQ4eK-Yfhk2l2yT132UeECXwAjGSVdMkUYyIOyOmwCOn77xFMcnF&vault=true&intent=subscription';
    script.async = true;

    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        // Clear previous buttons if any (though useEffect cleanup handles script removal, buttons might persist in DOM if not careful)
        paypalRef.current.innerHTML = '';

        window.paypal.Buttons({
          style: {
            shape: 'pill',
            color: 'silver',
            layout: 'horizontal',
            label: 'paypal'
          },
          createSubscription: function (_data: any, actions: any) {
            return actions.subscription.create({
              plan_id: plan.id
            });
          },
          onApprove: async function (data: any, _actions: any) {
            // Save subscription data
            const subscriptionData = {
              subscriptionID: data.subscriptionID,
              status: 'ACTIVE',
              startTime: new Date().toISOString(),
              plan_id: plan.id,
              amount: plan.price
            };

            saveSubscription(subscriptionData as any); // Save to local for immediate UI update

            // Save to Appwrite
            try {
              const { default: databaseService } = await import('../services/database');
              await databaseService.createSubscription({
                paypal_subscription_id: data.subscriptionID,
                plan_id: plan.id,
                status: 'active',
                start_time: new Date().toISOString(),
                amount: plan.price
              });
              console.log('Subscription saved to Appwrite');
            } catch (err) {
              console.error('Failed to save subscription to Appwrite', err);
              // We don't block success flow if DB save fails, but maybe alert user/admin?
            }

            onSubscriptionSuccess(data.subscriptionID);
          },
          onError: function (err: any) {
            console.error('PayPal subscription error:', err);
            onSubscriptionError('حدث خطأ أثناء إنشاء الاشتراك. يرجى المحاولة مرة أخرى.');
          }
        }).render(paypalRef.current);
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [plan, onSubscriptionSuccess, onSubscriptionError]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">اشترك في منصة الخبير</h2>
        <p className="text-slate-600">احصل على وصول كامل لجميع الميزات</p>
      </div>

      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">{plan.name}</h3>
          <div className="text-2xl font-bold text-blue-900">
            {plan.price} {plan.currency}
            <span className="text-sm font-normal text-blue-700"> / {plan.interval === 'monthly' ? 'شهر' : 'سنة'}</span>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            تحليل القضايا القانونية
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            تحويل الصوت إلى نص
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            توليد التقارير
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            الأسئلة القانونية
          </li>
        </ul>
      </div>

      <div ref={paypalRef} className="w-full"></div>

      <p className="text-xs text-slate-500 text-center mt-4">
        الاشتراك قابل للإلغاء في أي وقت
      </p>
    </div>
  );
};

export default PayPalSubscription; 