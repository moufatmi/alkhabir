import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import AdminOverviewTab from "./admin/AdminOverviewTab";
import AdminUsersTab from "./admin/AdminUsersTab";
import AdminCasesTab from "./admin/AdminCasesTab";

const AdminDashboard: React.FC = () => {
  const { user, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  React.useEffect(() => {
    const checkTeams = async () => {
      if (user) {
        try {
          const { teams } = await import('../lib/appwrite');
          const teamList = await teams.list();
          setDebugInfo(teamList);
        } catch (e: any) {
          setDebugInfo({ error: e.message });
        }
      }
    };
    checkTeams();

    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (isAdmin) {
        // If confirmed admin, explicit redirect not needed as we are on the page?
        // No, AdminDashboard IS the destination. So we just stay here.
        // But if current path is NOT admin path? This component is only rendered on admin path.
      } else if (!isAdmin && !debugInfo) {
        // Only redirect if we haven't gathered debug info yet? 
        // Or maybe we should wait for debug info before redirecting?
        // To be safe, let's keep the redirect DISABLED for the user to see the error 
        // IF they are genuinely failing.
        // navigate('/client');
      }
    }
  }, [user, isAdmin, loading, navigate, debugInfo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If user is logged in but not admin (according to context), show Debug Screen
  if (user && !isAdmin) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-900">
        <h1 className="text-3xl font-bold mb-4">Access Denied (Debug Mode)</h1>
        <p className="mb-4">You are logged in as <strong>{user.name}</strong> ({user.email}), but the system does not recognize you as an Admin.</p>

        <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl text-left font-mono text-sm overflow-auto">
          <h3 className="font-bold border-b pb-2 mb-2">Auth Context State:</h3>
          <p>isAdmin: {isAdmin.toString()}</p>

          <h3 className="font-bold border-b pb-2 mb-2 mt-4">Appwrite Teams Found:</h3>
          {debugInfo ? (
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          ) : (
            <p>Loading teams...</p>
          )}
        </div>

        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Retry / Reload
        </button>
        <button onClick={() => navigate('/client')} className="mt-4 px-6 py-2 border border-red-600 text-red-600 rounded hover:bg-red-100">
          Go to Client Dashboard
        </button>
      </div>
    );
  }

  // Double check to avoid flash of content
  if (!user) return null; // Should be handled by useEffect redirect

  // Strict Admin Check
  // In a real app, this should check a Team membership or user label/preference
  // For this prototype, we assume anyone accessing this route is authorized 
  // (since the route itself is obscure: /moussabfatmimariem)

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleCreateNewCase = () => {
    navigate('/');
  };

  // Mock Stats for Overview
  const stats = {
    totalUsers: 145,
    totalCases: 89,
    activeSubscriptions: 42,
    revenue: 45000
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      user={user}
    >
      {activeTab === 'overview' && <AdminOverviewTab stats={stats} />}
      {activeTab === 'clients' && <AdminUsersTab />}
      {activeTab === 'cases' && <AdminCasesTab />}
      {activeTab === 'subscriptions' && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <h2 className="text-xl font-bold mb-2">إدارة الاشتراكات</h2>
          <p>قريباً... سيتم ربط هذه الصفحة بواجهة PayPal API بشكل مباشر.</p>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <h2 className="text-xl font-bold mb-2">إعدادات المدير</h2>
          <p>قريباً...</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
