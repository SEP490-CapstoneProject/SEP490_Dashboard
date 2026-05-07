import { useState, useEffect } from "react";
import { Bell, CheckCheck, LogOut } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { formatTimeAgo } from "@/utils/FormatTime";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { logout } from "@/store/features/auth/authSlice";

export const DashboardHeader = () => {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);

  // --- Logic Xử lý ---
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(
        "https://notification-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/notifications/unread-count",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (e) {
      console.error("Lỗi lấy số thông báo:", e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        "https://notification-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/notifications?limit=10",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      setNotifications(data.items || data);
    } catch (e) {
      console.error("Lỗi lấy danh sách thông báo:", e);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(
        `https://notification-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchUnreadCount();
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error("Lỗi đánh dấu đã đọc:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        "https://notification-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/notifications/read-all",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchUnreadCount();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Lỗi đánh dấu tất cả:", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Polling mỗi 1 phút
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-end px-8 sticky  z-10 shadow-sm shadow-slate-500/5">

      {/* Bên phải: Chức năng & Profile */}
      <div className="flex items-center gap-6">
        
        {/* 1. Notification Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotiDropdown(!showNotiDropdown);
              if (!showNotiDropdown) fetchNotifications();
            }}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all relative group cursor-pointer"
          >
            <Bell
              size={20}
              className={cn(
                "transition-colors",
                showNotiDropdown ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600"
              )}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotiDropdown && (
            <>
              {/* Overlay để đóng dropdown khi click ngoài */}
              <div className="fixed inset-0 z-[-1]" onClick={() => setShowNotiDropdown(false)} />
              
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    Thông báo mới
                  </span>
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <CheckCheck size={14} />
                    Đọc tất cả
                  </button>
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors relative",
                          !n.isRead && "bg-blue-50/20"
                        )}
                      >
                        {!n.isRead && (
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        )}
                        <p className="text-[13px] font-bold text-slate-700 leading-snug">
                          {n.title}
                        </p>
                        <p className="text-[12px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {n.content}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-tight">
                          {formatTimeAgo(n.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-slate-400 text-[12px] font-medium">
                      Hiện tại chưa có thông báo nào.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. Vertical Divider */}
        <div className="w-px h-6 bg-slate-100" />

        {/* 3. User Profile & Logout Area */}
        <div className="flex items-center gap-3 pl-2 group">
          <div className="flex flex-col items-end min-w-0">
            <p className="text-[13px] font-black text-slate-800 truncate leading-tight">
              {user?.email || "Quản trị viên"}
            </p>
            <p className="text-[10px] text-slate-400 font-bold truncate italic leading-tight">
              {user?.email}
            </p>
          </div>

          {/* Avatar Area */}
          <div className="w-10 h-10 rounded-xl bg-amber-100 overflow-hidden shrink-0 border-2 border-white shadow-sm transition-transform group-hover:scale-105 duration-200">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "Admin"}`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-1 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer relative group/logout"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut
              size={18}
              className="group-hover/logout:translate-x-0.5 transition-transform"
            />
          </button>
        </div>
      </div>
    </header>
  );
};