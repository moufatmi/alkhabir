import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import AdminOverviewTab from "./admin/AdminOverviewTab";
import AdminUsersTab from "./admin/AdminUsersTab";
import AdminCasesTab from "./admin/AdminCasesTab";
import AdminSubscriptionsTab from "./admin/AdminSubscriptionsTab";

const AdminDashboard: React.FC = () => {
  const { user, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Real Data State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCases: 0,
    activeSubscriptions: 0, // Placeholder until we have a subscriptions collection
    revenue: 0 // Placeholder
  });
  // const [allCases, setAllCases] = useState<any[]>([]); // Removed unused
  const [uniqueUsers, setUniqueUsers] = useState<any[]>([]);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/client');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch Real Data
  React.useEffect(() => {
    if (isAdmin) {
      const fetchData = async () => {
        try {
          const { default: databaseService } = await import('../services/database');
          const cases = await databaseService.getAllCases();
          const subscriptions = await databaseService.getAllSubscriptions();

          setRecentCases(cases.slice(0, 5));

          // Aggregate Users from both collections
          const userMap = new Map();

          // Process Cases
          cases.forEach((c: any) => {
            if (!userMap.has(c.user_id)) {
              userMap.set(c.user_id, {
                id: c.user_id,
                name: `Client ${c.user_id.substring(0, 5)}...`,
                email: 'N/A',
                casesCount: 0,
                lastActive: c.$createdAt,
                status: 'active'
              });
            }
            const userData = userMap.get(c.user_id);
            userData.casesCount++;
            if (new Date(c.$createdAt) > new Date(userData.lastActive)) {
              userData.lastActive = c.$createdAt;
            }
          });

          // Process Subscriptions (for better names/emails and identifying users without cases)
          subscriptions.forEach((s: any) => {
            if (!userMap.has(s.user_id)) {
              userMap.set(s.user_id, {
                id: s.user_id,
                name: s.user_name || `Client ${s.user_id.substring(0, 5)}...`,
                email: s.user_email || 'N/A',
                casesCount: 0,
                lastActive: s.$createdAt,
                status: 'active'
              });
            } else {
              const userData = userMap.get(s.user_id);
              if (s.user_name) userData.name = s.user_name;
              if (s.user_email) userData.email = s.user_email;
              if (new Date(s.$createdAt) > new Date(userData.lastActive)) {
                userData.lastActive = s.$createdAt;
              }
            }
          });

          const usersList = Array.from(userMap.values());
          setUniqueUsers(usersList.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()));

          // Stats
          const activeSubs = subscriptions.filter((s: any) => s.status === 'active');
          const revenue = subscriptions.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

          setStats({
            totalUsers: userMap.size,
            totalCases: cases.length,
            activeSubscriptions: activeSubs.length,
            revenue: revenue
          });
        } catch (error) {
          console.error("Failed to fetch admin data", error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isAdmin]);

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Double check to avoid flash of content
  if (!user || !isAdmin) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      user={user}
    >
      {activeTab === 'overview' && <AdminOverviewTab stats={stats} recentCases={recentCases} recentUsers={uniqueUsers.slice(0, 5)} />}
      {activeTab === 'clients' && <AdminUsersTab users={uniqueUsers} />}
      {activeTab === 'cases' && <AdminCasesTab />}
      {activeTab === 'subscriptions' && <AdminSubscriptionsTab />}
    </AdminLayout>
  );
};

export default AdminDashboard;
