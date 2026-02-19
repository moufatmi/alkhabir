import React from 'react';
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react';

interface AdminOverviewTabProps {
    stats: {
        totalUsers: number;
        totalCases: number;
        activeSubscriptions: number;
        revenue: number;
    };
    recentCases?: any[];
    recentUsers?: any[];
}

const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ stats, recentCases = [], recentUsers = [] }) => {
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-bold text-lg mb-4 text-slate-800">آخر المستخدمين النشطين</h2>
                    <div className="space-y-4">
                        {recentUsers.length === 0 ? (
                            <p className="text-slate-400 text-sm">لا يوجد مستخدمين نشطين مؤخراً.</p>
                        ) : recentUsers.map((user, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        {user.name.charAt(7) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.id}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">{new Date(user.lastActive).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-bold text-lg mb-4 text-slate-800">آخر القضايا المضافة</h2>
                    <div className="space-y-4">
                        {recentCases.length === 0 ? (
                            <p className="text-slate-400 text-sm">لا يوجد قضايا حديثة.</p>
                        ) : recentCases.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-purple-100 text-purple-600">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{c.title}</p>
                                        <p className={`text-xs font-medium ${c.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {c.status === 'completed' ? 'مكتملة' : 'قيد المعالجة'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">{new Date(c.$createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewTab;
