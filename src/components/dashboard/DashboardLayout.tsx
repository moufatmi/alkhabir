import React from 'react';
import Sidebar from './Sidebar';
import Header from '../Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    user: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    activeTab,
    setActiveTab,
    onLogout,
    user
}) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* We can reuse the main Header or create a simplified dashboard header if needed */}
            {/* For now, let's keep the main Header for consistency, 
          but usually dashboards have their own top bar. 
          Let's stick to the sidebar layout as primary nav. */}

            <div className="flex flex-1 flex-row-reverse overflow-hidden">
                {/* Sidebar (Right side for RTL) */}
                <aside className="hidden md:block">
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-6xl mx-auto">
                        {/* Mobile Header (optional, for later) */}
                        <div className="md:hidden mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow">
                            {/* Simplified mobile menu trigger could go here */}
                            <h1 className="text-xl font-bold">لوحة التحكم</h1>
                        </div>

                        {/* Top Bar / Welcome */}
                        <header className="mb-8 flex justify-between items-center" dir="rtl">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    {activeTab === 'overview' && 'نظرة عامة'}
                                    {activeTab === 'cases' && 'ملفات القضايا'}
                                    {activeTab === 'subscription' && 'تفاصيل الاشتراك'}
                                    {activeTab === 'settings' && 'إعدادات الحساب'}
                                </h1>
                                <p className="text-slate-500 mt-1">مرحباً بك، {user?.name || user?.email}</p>
                            </div>
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                {/* Avatar placeholder */}
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                            </div>
                        </header>

                        {/* Dynamic Content */}
                        <div className="fade-in" dir="rtl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
