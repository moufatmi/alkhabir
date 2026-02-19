import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Search } from 'lucide-react';
import databaseService from '../../services/database';

const AdminSubscriptionsTab: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const subs = await databaseService.getAllSubscriptions();
                setSubscriptions(subs);
            } catch (error) {
                console.error("Failed to fetch subscriptions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    const filteredSubs = subscriptions.filter(sub =>
        (sub.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (sub.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        sub.paypal_subscription_id?.includes(searchTerm)
    );

    if (loading) {
        return <div className="p-8 text-center text-slate-500">جاري تحميل الاشتراكات...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">إدارة الاشتراكات</h1>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold">
                    إجمالي الدخل: {subscriptions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)} MAD
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="بحث برقم الاشتراك أو البريد..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-red-500 bg-slate-50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
                            <tr>
                                <td className="p-4">المستخدم</td>
                                <td className="p-4">الخطة</td>
                                <td className="p-4">الحالة</td>
                                <td className="p-4">المبلغ</td>
                                <td className="p-4">تاريخ البدء</td>
                                <td className="p-4">معرف PayPal</td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSubs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        لا توجد اشتراكات مسجلة. (تأكد من إعداد مجموعة البيانات في Appwrite)
                                    </td>
                                </tr>
                            ) : filteredSubs.map(sub => (
                                <tr key={sub.$id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{sub.user_name || 'غير معروف'}</p>
                                        <p className="text-xs text-slate-500">{sub.user_email || sub.user_id}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                                            {sub.plan_id === 'lawyer' ? 'محام' : sub.plan_id}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {sub.status === 'active' ? (
                                            <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                                <CheckCircle size={14} /> نشط
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-500 font-bold text-xs">
                                                <XCircle size={14} /> غير نشط
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-slate-700">{sub.amount} MAD</td>
                                    <td className="p-4 text-sm text-slate-500">
                                        {new Date(sub.start_time).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-xs font-mono text-slate-400">
                                        {sub.paypal_subscription_id}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSubscriptionsTab;
