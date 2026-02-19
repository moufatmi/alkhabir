import React from 'react';
import { Home, Users, FileText, CreditCard, LogOut, Shield } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    const menuItems = [
        { id: 'overview', label: 'نظرة عامة', icon: Home },
        { id: 'clients', label: 'الزبناء', icon: Users },
        { id: 'cases', label: 'جميع القضايا', icon: FileText },
        { id: 'subscriptions', label: 'الاشتراكات', icon: CreditCard },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl">
            <div className="p-6 flex items-center gap-3 border-b border-slate-700">
                <Shield className="text-red-500" size={32} />
                <div>
                    <h1 className="font-bold text-xl tracking-wide">الخبير</h1>
                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider">لوحة المدير</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-red-600 text-white shadow-lg translate-x-1'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">تسجيل خروج</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
