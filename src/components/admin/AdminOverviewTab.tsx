import React from 'react';
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react';

interface AdminOverviewTabProps {
    stats: {
        totalUsers: number;
        totalCases: number;
        activeSubscriptions: number;
        revenue: number;
    };
}

const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ stats }) => {
    const cardData = [
        { label: 'إجمالي الزبناء', value: stats.totalUsers, icon: Users, color: 'blue' },
        { label: 'إجمالي القضايا', value: stats.totalCases, icon: FileText, color: 'purple' },
        { label: 'الاشتراكات النشطة', value: stats.activeSubscriptions, icon: TrendingUp, color: 'green' },
        { label: 'الإيرادات الشهرية', value: `${stats.revenue} د.م`, icon: DollarSign, color: 'orange' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">نظرة عامة</h1>
                <p className="text-slate-500">مرحباً بك في لوحة التحكم. إليك ملخص نشاط المنصة.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cardData.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-${card.color}-100 text-${card.color}-600`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-bold text-lg mb-4 text-slate-800">آخر المستخدمين المسجلين</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        U{i}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">مستخدم جديد {i}</p>
                                        <p className="text-xs text-slate-500">user{i}@example.com</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">منذ {i} ساعة</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-bold text-lg mb-4 text-slate-800">آخر القضايا المضافة</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-purple-100 text-purple-600">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">قضية رقم #2024-{100 + i}</p>
                                        <p className="text-xs text-green-600 font-medium">مكتملة</p>
                                    </div>
                                </div>
                                <button className="text-xs text-blue-600 hover:underline">عرض التفاصيل</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewTab;
