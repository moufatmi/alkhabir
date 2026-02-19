import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import databaseService, { CaseDocument } from "../services/database";
import { hasActiveSubscription, getSubscription } from "../services/paypalService";
import DashboardLayout from "./dashboard/DashboardLayout";
import OverviewTab from "./dashboard/OverviewTab";
import CasesTab from "./dashboard/CasesTab";
import SubscriptionTab from "./dashboard/SubscriptionTab";
import SettingsTab from "./dashboard/SettingsTab";
import { useNavigate } from "react-router-dom";

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [cases, setCases] = useState<CaseDocument[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const isSubscribed = hasActiveSubscription();
  const subscriptionData = getSubscription();

  useEffect(() => {
    if (user) {
      loadCases();
    }
  }, [user]);

  const loadCases = async () => {
    try {
      if (!user) return;
      setLoadingCases(true);
      const userCases = await databaseService.getUserCases(user.$id);
      setCases(userCases);
    } catch (err: any) {
      console.error("Failed to load cases", err);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleCreateNewCase = () => {
    // Navigate to main app logic or open modal
    // For now, redirect to home where the main analysis tool is
    navigate('/');
  };

  if (!user) return <div>جاري التحميل...</div>;

  const stats = {
    totalCases: cases.length,
    activeSubscription: isSubscribed,
    lastLogin: new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      user={user}
    >
      {activeTab === 'overview' && <OverviewTab stats={stats} />}
      {activeTab === 'cases' && (
        <CasesTab
          cases={cases}
          isLoading={loadingCases}
          onCreateNew={handleCreateNewCase}
        />
      )}
      {activeTab === 'subscription' && (
        <SubscriptionTab
          isSubscribed={isSubscribed}
          planName={isSubscribed ? 'محامٍ (مفعل)' : 'مجاني'}
          expiryDate={subscriptionData?.endTime ? new Date(subscriptionData.endTime).toLocaleDateString('ar-EG') : undefined}
        />
      )}
      {activeTab === 'settings' && <SettingsTab user={user} />}
    </DashboardLayout>
  );
};

export default ClientDashboard;
