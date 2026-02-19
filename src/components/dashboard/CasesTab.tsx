import React, { useState } from 'react';
import { Search, Plus, FileText, Download, Trash2 } from 'lucide-react';
import { CaseDocument } from '../../services/database';

interface CasesTabProps {
    cases: CaseDocument[];
    isLoading: boolean;
    onCreateNew: () => void;
}

const CasesTab: React.FC<CasesTabProps> = ({ cases, isLoading, onCreateNew }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCases = cases.filter(c =>
        c.title.includes(searchTerm) || c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث في القضايا..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                    />
                </div>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                    <Plus size={20} />
                    قضية جديدة
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">العنوان</th>
                            <th className="px-6 py-4">التاريخ</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4">المرفقات</th>
                            <th className="px-6 py-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-500">جاري تحميل القضايا...</td>
                            </tr>
                        ) : filteredCases.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center">
                                        <div className="p-4 bg-slate-100 rounded-full mb-3">
                                            <FileText size={32} className="text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">لا توجد قضايا حتى الآن</p>
                                        <p className="text-slate-400 text-sm mt-1">ابدأ بإنشاء قضية جديدة لتحليلها</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCases.map((c) => (
                                <tr key={c.$id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{c.title}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{c.description.substring(0, 50)}...</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {new Date(c.$createdAt).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            مكتمل
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {c.attachment_id ? (
                                            <span className="text-blue-600 flex items-center gap-1">
                                                <FileText size={14} /> ملف مرفق
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button className="text-slate-400 hover:text-blue-600 transition-colors" title="تحميل التقرير">
                                                <Download size={18} />
                                            </button>
                                            <button className="text-slate-400 hover:text-red-600 transition-colors" title="حذف">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CasesTab;
