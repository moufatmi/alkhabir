import React from 'react';
import PayPalSubscription from '../PayPalSubscription';
import { getPlan } from '../../services/paypalService';

interface SubscriptionTabProps {
    isSubscribed: boolean;
    planName?: string;
    expiryDate?: string;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ isSubscribed, planName = 'مجاني', expiryDate }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Current Plan Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">خطة الاشتراك الحالية</h2>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-600">الحالة</span>
                            <span className={`font-bold px-3 py-1 rounded-full ${isSubscribed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {isSubscribed ? 'نشط ✅' : 'غير نشط / مجاني'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-600">الخطة</span>
                            <span className="font-bold text-blue-900">{planName}</span>
                        </div>

                        {expiryDate && (
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-600">تاريخ التجديد</span>
                                <span className="font-mono text-slate-800">{expiryDate}</span>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-1/2">
                        {!isSubscribed ? (
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                                <h3 className="font-bold text-blue-900 mb-2">قم بالترقية الآن</h3>
                                <p className="text-sm text-blue-700 mb-4">احصل على وصول كامل لمميزات التحليل الذكي وتوليد التقارير.</p>
                                {/* PayPal Component */}
                                <PayPalSubscription
                                    plan={getPlan('محام')!}
                                    onSubscriptionSuccess={() => window.location.reload()}
                                    onSubscriptionError={(err) => alert(err)}
                                />
                            </div>
                        ) : (
                            <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                                <h3 className="font-bold text-green-900 mb-2">أنت عضو مميز</h3>
                                <p className="text-sm text-green-700">شكراً لثقتك في منصة الخبير. اشتراكك ساري المفعول.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Billing History (Placeholder) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 opacity-70 cursor-not-allowed">
                <h2 className="text-xl font-bold text-slate-800 mb-4">سجل المدفوعات (قريباً)</h2>
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    لا توجد فواتير سابقة لعرضها
                </div>
            </div>
        </div>
    );
};

export default SubscriptionTab;
