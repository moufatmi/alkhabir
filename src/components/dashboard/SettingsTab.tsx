import React, { useState } from 'react';
import { User, Lock, Bell, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsTabProps {
    user: any;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user }) => {
    const { updateName, updatePassword } = useAuth();

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameLoading, setNameLoading] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState(false);

    // Password State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleUpdateName = async () => {
        if (!name.trim()) return;
        setNameLoading(true);
        setNameError(null);
        setNameSuccess(false);
        try {
            if (updateName) {
                await updateName(name);
                setNameSuccess(true);
                setIsEditingName(false);
                setTimeout(() => setNameSuccess(false), 3000);
            }
        } catch (err: any) {
            setNameError("فشل تحديث الاسم. حاول مرة أخرى.");
            console.error(err);
        } finally {
            setNameLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 8) {
            setPasswordError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
            return;
        }

        setPasswordLoading(true);
        setPasswordError(null);
        setPasswordSuccess(false);

        try {
            if (updatePassword) {
                await updatePassword(newPassword, currentPassword);
                setPasswordSuccess(true);
                setNewPassword('');
                setCurrentPassword('');
                setShowPasswordForm(false);
                setTimeout(() => setPasswordSuccess(false), 3000);
                alert("تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مرة أخرى.");
            }
        } catch (err: any) {
            setPasswordError("فشل تحديث كلمة المرور. تأكد من كلمة المرور الحالية.");
            console.error(err);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <User className="text-blue-600" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">المعلومات الشخصية</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isEditingName || nameLoading}
                                className={`w-full p-2.5 border rounded-lg outline-none transition-colors ${isEditingName ? 'border-blue-500 ring-2 ring-blue-100 bg-white' : 'border-slate-300 bg-slate-50'
                                    }`}
                            />
                            {isEditingName ? (
                                <button
                                    onClick={handleUpdateName}
                                    disabled={nameLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
                                >
                                    <Check size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                                >
                                    تعديل
                                </button>
                            )}
                        </div>
                        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                        {nameSuccess && <p className="text-green-600 text-sm mt-1">تم تحديث الاسم بنجاح!</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            defaultValue={user?.email || ''}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
                            disabled
                        />
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <Lock className="text-orange-600" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">الأمان وكلمة المرور</h2>
                </div>

                {!showPasswordForm ? (
                    <div className="space-y-4">
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
                        >
                            • تغيير كلمة المرور
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2" disabled>
                            • تفعيل المصادقة الثنائية (2FA) (قريباً)
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور الحالية</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور الجديدة</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                minLength={8}
                                required
                            />
                        </div>
                        {passwordError && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                                <AlertCircle size={16} />
                                {passwordError}
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                {passwordLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPasswordForm(false)}
                                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Notifications (Optional) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <Bell className="text-purple-600" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">الإشعارات</h2>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                        <span className="text-slate-700">إرسال إشعار عند اكتمال تحليل قضية</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                        <span className="text-slate-700">نشرة الخبير الأسبوعية</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
