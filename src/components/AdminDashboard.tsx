import React from "react";
import Header from "./Header";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useUserRole } from "../hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { setUserRole } from "../services/adminAuth";

const AdminDashboard: React.FC = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const { role, loading: loadingRole } = useUserRole(user ?? null);
  const [promoteUid, setPromoteUid] = React.useState("");
  const [promoteRole, setPromoteRole] = React.useState<'admin' | 'client'>("client");
  const [promoteMsg, setPromoteMsg] = React.useState("");

  if (loadingAuth || loadingRole) return <div>جاري التحميل...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/client" />;

  console.log("AdminDashboard: user", user, "role", role);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteMsg("");
    try {
      await setUserRole(promoteUid, promoteRole);
      setPromoteMsg(`تم تعيين الدور (${promoteRole}) بنجاح.`);
    } catch (err) {
      setPromoteMsg("حدث خطأ أثناء تعيين الدور. تأكد من صحة UID.");
    }
  };

  return (
    <>
      <Header />
      <div>
        <h1>لوحة تحكم المدير</h1>
        {/* هنا الأدوات الخاصة بك فقط */}
        <div style={{marginTop: 32, padding: 24, background: '#f9fafb', borderRadius: 12, maxWidth: 400}}>
          <h2 style={{fontSize: 18, marginBottom: 12}}>تعيين دور المستخدم</h2>
          <form onSubmit={handlePromote} style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <input
              type="text"
              placeholder="أدخل UID المستخدم"
              value={promoteUid}
              onChange={e => setPromoteUid(e.target.value)}
              style={{padding: 8, borderRadius: 6, border: '1px solid #ddd'}}
              required
            />
            <select
              value={promoteRole}
              onChange={e => setPromoteRole(e.target.value as 'admin' | 'client')}
              style={{padding: 8, borderRadius: 6, border: '1px solid #ddd'}}
            >
              <option value="admin">مدير</option>
              <option value="client">عميل</option>
            </select>
            <button
              type="submit"
              style={{padding: '10px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer'}}
            >
              تعيين الدور
            </button>
          </form>
          {promoteMsg && <div style={{marginTop: 10, color: promoteMsg.includes('نجاح') ? '#16a34a' : '#dc2626'}}>{promoteMsg}</div>}
        </div>
      </div>
    </>
  );
};
export default AdminDashboard;
