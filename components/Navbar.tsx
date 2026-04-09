
import React from 'react';
import { User } from '../types';
import Logo from './Logo';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onLogoClick?: () => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, onLogoClick, currentPage }) => {
  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50 border-b border-blue-800/50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer group" 
          onClick={() => {
            if (user?.role === 'admin') {
              onNavigate('admin-dashboard');
            } else if (user?.role === 'driver') {
              onNavigate('driver-dashboard');
            } else {
              onNavigate('home');
            }
            if (onLogoClick) onLogoClick();
          }}
        >
          <Logo className="w-8 h-8 md:w-12 md:h-12 transition-transform group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="text-2xl md:text-4xl font-black text-amber-500 leading-none">تاج باص</span>
            <span className="text-sm md:text-base text-blue-300 font-bold uppercase tracking-tighter">سفر كالملوك</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 text-xl font-black">
          {(!user || user.role === 'user') && (
            <button 
              onClick={() => onNavigate('home')} 
              className={`transition-all flex flex-col items-center py-2 px-1 ${currentPage === 'home' ? 'text-amber-500 scale-110' : 'text-blue-100 hover:text-white hover:scale-105'}`}
            >
              <span>الرئيسية</span>
              {currentPage === 'home' && <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
            </button>
          )}
          
          {user && (
            <>
              {user.role === 'admin' && (
                <button 
                  onClick={() => onNavigate('admin-dashboard')} 
                  className={`transition-all flex flex-col items-center py-2 px-1 ${currentPage === 'admin-dashboard' ? 'text-amber-500 scale-110' : 'text-blue-100 hover:text-white hover:scale-105'}`}
                >
                  <span>لوحة الإدارة</span>
                  {currentPage === 'admin-dashboard' && <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                </button>
              )}
              {user.role === 'driver' && (
                <button 
                  onClick={() => onNavigate('driver-dashboard')} 
                  className={`transition-all flex flex-col items-center py-2 px-1 ${currentPage === 'driver-dashboard' ? 'text-amber-500 scale-110' : 'text-blue-100 hover:text-white hover:scale-105'}`}
                >
                  <span>بوابة الكابتن</span>
                  {currentPage === 'driver-dashboard' && <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                </button>
              )}
              {user.role === 'user' && (
                <button 
                  onClick={() => onNavigate('my-tickets')} 
                  className={`transition-all flex flex-col items-center py-2 px-1 ${currentPage === 'my-tickets' ? 'text-amber-500 scale-110' : 'text-blue-100 hover:text-white hover:scale-105'}`}
                >
                  <span>رحلاتي وحجوزاتي</span>
                  {currentPage === 'my-tickets' && <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                </button>
              )}
              {(!user || user.role === 'user') && (
                <button 
                  onClick={() => onNavigate('complaints')} 
                  className={`transition-all flex flex-col items-center py-2 px-1 ${currentPage === 'complaints' ? 'text-amber-500 scale-110' : 'text-blue-100 hover:text-white hover:scale-105'}`}
                >
                  <span>الشكاوي</span>
                  {currentPage === 'complaints' && <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {!user && (
            <div className="hidden sm:flex items-center gap-6 border-l border-blue-800/50 pl-6 ml-2">
              <button 
                onClick={() => onNavigate('admin-login')} 
                className="text-lg font-black text-blue-300 hover:text-amber-500 transition-colors uppercase tracking-widest"
              >
                دخول الإدارة
              </button>
              <button 
                onClick={() => onNavigate('driver-login')} 
                className="text-lg font-black text-blue-300 hover:text-emerald-500 transition-colors uppercase tracking-widest"
              >
                دخول السائقين
              </button>
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-base md:text-lg text-blue-300 font-bold">مرحباً بك</span>
                <span className="text-lg md:text-xl font-black">{user.name}</span>
              </div>
              <button 
                onClick={onLogout} 
                className="bg-red-500/10 text-red-400 px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-base md:text-lg font-bold"
              >
                خروج
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('login')} 
              className="bg-amber-500 text-blue-900 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center gap-2 text-xs md:text-sm"
            >
              <svg className="w-4 h-4 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span className="hidden xs:inline">دخول / تسجيل</span>
              <span className="xs:hidden">دخول</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
