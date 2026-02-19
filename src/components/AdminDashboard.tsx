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
          // setAllCases(cases);
          setRecentCases(cases.slice(0, 5)); // Take top 5 recent cases

          // Calculate Stats
          const uniqueUserIds = new Set(cases.map(c => c.user_id));
          const usersList = Array.from(uniqueUserIds).map(uid => {
            const userCases = cases.filter(c => c.user_id === uid);
            const lastCase = userCases.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())[0];
            return {
              id: uid,
              // We don't have profile data, so we improvise
              name: `Client ${uid.substring(0, 5)}...`,
              email: 'N/A', // No email in case doc
              casesCount: userCases.length,
              lastActive: lastCase.$createdAt,
              status: 'active'
            };
          });
          setUniqueUsers(usersList);

          // Fetch Subscriptions for Stats
          let activeSubsCount = 0;
          let revenueTotal = 0;
          try {
            const subs = await databaseService.getAllSubscriptions();
            activeSubsCount = subs.filter((s: any) => s.status === 'active').length;
            revenueTotal = subs.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
          } catch (e) {
            console.log("Could not fetch subscriptions for stats yet");
          }

          setStats({
            totalUsers: uniqueUserIds.size,
            totalCases: cases.length,
            activeSubscriptions: activeSubsCount,
            revenue: revenueTotal
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
