import React from 'react';
import { Home, FileText, CreditCard, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    const menuItems = [
        { id: 'overview', label: 'نظرة عامة', icon: Home },
        { id: 'cases', label: 'قضاياي', icon: FileText },
        { id: 'subscription', label: 'الاشتراك', icon: CreditCard },
        { id: 'settings', label: 'الإعدادات', icon: Settings },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-center">
                <h2 className="text-xl font-bold aref-ruqaa-bold text-blue-400">لوحة العميل</h2>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">تسجيل خروج</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
