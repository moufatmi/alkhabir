import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { useUserRole } from "../hooks/useUserRole";

const Header: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-primary-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between flex-row-reverse">
        {/* Logo and App Name */}
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img src="/logo.svg" alt="Scales of Justice" className="w-12 h-12 relative z-10 drop-shadow-sm" />
          </div>
          <div className="flex flex-col items-end">
            <h1 className="text-2xl font-bold text-primary-900 font-serif leading-none tracking-wide">الخبير | Alkhabir</h1>
            <p className="text-xs text-primary-600 font-medium tracking-wider mt-1">المساعد الذكي للقانوني</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-slate-600 hover:text-primary-700 font-medium transition-colors text-sm">الرئيسية</Link>
          {user && (
            <Link
              to={isAdmin ? "/moussabfatmimariem" : "/client"}
              className="text-slate-600 hover:text-primary-700 font-medium transition-colors text-sm"
            >
              لوحة التحكم
            </Link>
          )}
          {!user && (
            <Link to="/login" className="text-slate-600 hover:text-primary-700 font-medium transition-colors text-sm">تسجيل الدخول</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
