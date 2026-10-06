import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell, X, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface Props {
  onClose: () => void;
}

const NotificationDropdown: React.FC<Props> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleItemClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
    onClose();
  };

  return (
    <>
      {/* Background Overlay for Mobile & Desktop Click-Outside */}
      <div
        className="fixed inset-0 z-40 bg-black/25 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none"
        onClick={onClose}
      />

      {/* Notification Card Container */}
      <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-3 sm:right-0 top-16 sm:top-full mt-2 w-auto sm:w-96 max-w-md mx-auto sm:mx-0 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1 font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[65vh] sm:max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 px-1">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3.5 text-left transition-colors cursor-pointer rounded-2xl my-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                  !notif.isRead ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-l-4 border-cyan-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs font-bold ${!notif.isRead ? 'text-cyan-950 dark:text-cyan-200' : 'text-slate-800 dark:text-slate-200'}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
                {notif.link && (
                  <span className="inline-flex items-center space-x-1 text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1.5">
                    <span>View details</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
