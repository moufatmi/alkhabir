import React, { useEffect, useState } from 'react';
import { Search, FileText, Download } from 'lucide-react';
import databaseService, { CaseDocument } from '../../services/database';
import storageService from '../../services/storage';

const AdminCasesTab: React.FC = () => {
    const [cases, setCases] = useState<CaseDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAllCases();
    }, []);

    const loadAllCases = async () => {
        try {
            setLoading(true);
            const allCases = await databaseService.getAllCases();
            setCases(allCases);
        } catch (err) {
            console.error("Failed to load cases", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCases = cases.filter(c =>
        c.title.includes(searchTerm) || c.description.includes(searchTerm) || c.status.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">جميع القضايا</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="بحث في القضايا..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-red-500 bg-slate-50"
                        />
                    </div>
                    <button onClick={loadAllCases} className="text-sm text-blue-600 hover:underline">
                        تحديث
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
                            <tr>
                                <td className="p-4">العنوان</td>
                                <td className="p-4">الوصف</td>
                                <td className="p-4">المستخدم (ID)</td>
                                <td className="p-4">الحالة</td>
                                <td className="p-4">التاريخ</td>
                                <td className="p-4">المرفقات</td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">جاري التحميل...</td>
                                </tr>
                            ) : filteredCases.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">لا توجد قضايا.</td>
                                </tr>
                            ) : (
                                filteredCases.map(c => (
                                    <tr key={c.$id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">{c.title}</td>
                                        <td className="p-4 text-sm text-slate-500 max-w-xs truncate" title={c.description}>
                                            {c.description}
                                        </td>
                                        <td className="p-4 text-xs font-mono text-slate-400">{c.user_id}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {c.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{new Date(c.$createdAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {c.attachment_id ? (
                                                <a
                                                    href={storageService.getFileView(c.attachment_id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                                                >
                                                    <Download size={14} /> عرض
                                                </a>
                                            ) : (
                                                <span className="text-slate-300 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCasesTab;
