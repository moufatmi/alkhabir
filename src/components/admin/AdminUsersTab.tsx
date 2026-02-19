import React, { useState } from 'react';
import { Search, MoreVertical, Trash2, Edit, Lock, Eye } from 'lucide-react';

const AdminUsersTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Users Data
    // In a real implementation, this would come from an Appwrite Cloud Function
    const [users, setUsers] = useState([
        { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', role: 'client', status: 'active', joined: '2024-01-15', location: 'الدار البيضاء' },
        { id: '2', name: 'فاطمة الزهراء', email: 'fatima@example.com', role: 'client', status: 'active', joined: '2024-01-20', location: 'الرباط' },
        { id: '3', name: 'كريم بنعلي', email: 'karim@example.com', role: 'admin', status: 'active', joined: '2023-12-01', location: 'مراكش' },
        { id: '4', name: 'سناء العلمي', email: 'sana@example.com', role: 'client', status: 'suspended', joined: '2024-02-01', location: 'طنجة' },
        { id: '5', name: 'يوسف التازي', email: 'youssef@example.com', role: 'client', status: 'active', joined: '2024-02-10', location: 'فاس' },
    ]);

    const filteredUsers = users.filter(user =>
        user.name.includes(searchTerm) || user.email.includes(searchTerm)
    );

    const handleDeleteUser = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            setUsers(users.filter(u => u.id !== id));
            alert('تم حذف المستخدم (محاكاة)');
        }
    };

    const handleResetPassword = (email: string) => {
        const newPass = prompt('أدخل كلمة المرور الجديدة:');
        if (newPass) {
            alert(`تم تغيير كلمة مرور ${email} إلى ${newPass} (محاكاة)`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">إدارة الزبناء</h1>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    + مستخدم جديد
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="بحث عن مستخدم (الاسم، البريد...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-red-500 bg-slate-50"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
                            <tr>
                                <td className="p-4">المستخدم</td>
                                <td className="p-4">الحالة</td>
                                <td className="p-4">الدور</td>
                                <td className="p-4">الموقع</td>
                                <td className="p-4">تاريخ التسجيل</td>
                                <td className="p-4">إجراءات</td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user.status === 'active' ? 'نشط' : 'موقوف'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-slate-600 capitalize">{user.role === 'admin' ? 'مدير' : 'زبون'}</span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{user.location}</td>
                                    <td className="p-4 text-sm text-slate-500">{user.joined}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="تغيير كلمة المرور"
                                                onClick={() => handleResetPassword(user.email)}
                                                className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                            >
                                                <Lock size={16} />
                                            </button>
                                            <button
                                                title="تفاصيل"
                                                className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                title="حذف"
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersTab;
