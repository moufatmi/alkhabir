import React, { useState } from 'react';
import { Search } from 'lucide-react';

const AdminUsersTab: React.FC<{ users?: any[] }> = ({ users = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.includes(searchTerm) || user.id.includes(searchTerm)
    );

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
                                <td className="p-4">المستخدم (ID)</td>
                                <td className="p-4">الحالة</td>
                                <td className="p-4">آخر نشاط</td>
                                <td className="p-4">قضايا</td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">لا يوجد مستخدمين.</td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                                                {user.name.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800" title={user.id}>{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email !== 'N/A' ? user.email : user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-bold bg-green-100 text-green-700`}>
                                            نشط
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{new Date(user.lastActive).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-bold">
                                            {user.casesCount} قضايا
                                        </span>
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
