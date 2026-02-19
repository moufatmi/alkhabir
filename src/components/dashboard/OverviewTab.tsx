import React from 'react';
import { Briefcase, AlertCircle, Clock } from 'lucide-react';

interface OverviewTabProps {
    stats: {
        totalCases: number;
        activeSubscription: boolean;
        lastLogin: string;
    };
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">إجمالي القضايا</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.totalCases}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stats.activeSubscription ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">حالة الاشتراك</p>
                        <h3 className={`text-2xl font-bold ${stats.activeSubscription ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.activeSubscription ? 'نشط' : 'غير نشط'}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">آخر دخول</p>
                        <h3 className="text-lg font-bold text-slate-800">{stats.lastLogin}</h3>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Welcome */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-4">مرحباً بك في منصة الخبير</h2>
                    <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
                        استمتع بتجربة إدارة قضاياك القانونية بكفاءة عالية. يمكنك البدء بإضافة قضية جديدة أو مراجعة تحليلاتك السابقة.
                    </p>
                 
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="absolute -left-20 -bottom-20 w-96 h-96 text-white" fill="currentColor" viewBox="0 0 200 200">
                        <path d="M45,-75C59,-69,71,-57,79,-43C87,-29,91,-13,89,2C87,17,79,31,69,44C59,57,47,69,33,76C19,83,3,85,-13,83C-29,81,-45,75,-58,64C-71,53,-81,37,-85,19C-89,1,-87,-17,-79,-32C-71,-47,-57,-59,-42,-65C-27,-71,-12,-71,3,-76L45,-75Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
