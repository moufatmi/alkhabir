import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    user?: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    activeTab,
    setActiveTab,
    onLogout,
    user
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    return (
        <div className="flex min-h-screen bg-slate-50" dir="rtl">
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 right-0 z-30 transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[100%]'
                }`}>
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogout={onLogout}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center lg:hidden">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-slate-800">لوحة المدير</span>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
