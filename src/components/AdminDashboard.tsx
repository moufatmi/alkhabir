import React from "react";
import Header from "./Header";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useUserRole } from "../hooks/useUserRole";
import { Navigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const { role, loading: loadingRole } = useUserRole(user ?? null);

  if (loadingAuth || loadingRole) return <div>جاري التحميل...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/client" />;

  return (
    <>
      <Header />
      <div>
        <h1>لوحة تحكم المدير</h1>
        {/* هنا الأدوات الخاصة بك فقط */}
      </div>
    </>
  );
};
export default AdminDashboard;
