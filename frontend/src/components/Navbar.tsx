import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  User as UserIcon,
  Bell,
  Sun,
  Moon,
  Monitor,
  Globe,
  LogOut,
  Shield,
  Stethoscope,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'DOCTOR') return '/doctor';
    return '/patient';
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to={user?.role === 'DOCTOR' ? '/doctor' : '/'} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              OPMD Care
            </span>
            <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400">
              {user?.role === 'DOCTOR' ? 'Doctor Clinical Portal' : 'Oral Screening & Tele-Oncology'}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-5">
          {user?.role === 'DOCTOR' ? (
            <>
              <Link
                to="/doctor?tab=overview"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center space-x-1"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-600" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/doctor?tab=requests"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <span>Requests</span>
              </Link>
              <Link
                to="/doctor?tab=payments"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <span>Payments</span>
              </Link>
              <Link
                to="/doctor?tab=appointments"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <span>Appointments</span>
              </Link>
              <Link
                to="/doctor?tab=profile_settings"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center space-x-1"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-600" />
                <span>Profile & Settings</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/screening" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                {t('nav.screening')}
              </Link>
              <Link to="/find-doctors" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                {t('nav.findDoctors')}
              </Link>
              {user && (
                <Link to={getDashboardLink()} className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
                  {t('nav.dashboard')}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Actions (Language, Theme, Notifications, User) */}
        <div className="flex items-center space-x-3">
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowThemeMenu(false);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
              title="Select Language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs uppercase font-bold">{i18n.language.substring(0, 2)}</span>
            </button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        localStorage.setItem('i18nextLng', lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                        i18n.language.startsWith(lang.code) ? 'text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50/50 dark:bg-cyan-950/30' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="font-medium">{lang.native}</span>
                      <span className="text-xs text-slate-400 font-mono uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowLangMenu(false);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </button>
            {showThemeMenu && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowThemeMenu(false)} />
                <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Moon className="w-4 h-4 text-cyan-400" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Monitor className="w-4 h-4 text-slate-400" />
                    <span>System</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications Bell */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowLangMenu(false);
                  setShowThemeMenu(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>
          )}

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowLangMenu(false);
                  setShowThemeMenu(false);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.email.substring(0, 1).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Activity className="w-4 h-4 text-cyan-600" />
                      <span>Dashboard</span>
                    </Link>
                    {user.role === 'DOCTOR' && (
                      <Link
                        to="/doctor?tab=profile_settings"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Settings className="w-4 h-4 text-cyan-600" />
                        <span>Profile & Settings</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:opacity-90 shadow-sm shadow-cyan-500/20"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;
