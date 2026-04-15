import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Users, Building2, MessageSquareText, Briefcase,
  Contact2, LogOut, ChevronLeft, ChevronRight,
  ChartBar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { logout } from "@/store/features/auth/authSlice";

const NAVIGATION = [
  {
    title: "NGƯỜI DÙNG",
    items: [
      { icon: Users, label: "Người dùng cá nhân", path: "/dashboard/users" },
      { icon: Building2, label: "Nhà tuyển dụng", path: "/dashboard/recruiters" },
    ],
  },
  {
    title: "NỘI DUNG",
    items: [
      { icon: MessageSquareText, label: "Bài đăng cộng đồng", path: "/dashboard/community-posts" },
      { icon: Contact2, label: "Portfolio", path: "/dashboard/portfolios" },
      { icon: Briefcase, label: "Bài đăng tuyển dụng", path: "/dashboard/job-posts" },
    ],
  },
  {
    title: "THỐNG KÊ",
    items: [
      { icon: ChartBar, label: "Thống kê doanh thu", path: "/dashboard/statistics" },
    ],
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-72" // Thu hẹp còn 80px hoặc mở rộng 288px
      )}
    >
      {/* Nút Toggle - Đặt ở vị trí mép Sidebar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-colors z-50 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header - Logo */}
      <div className={cn("p-6 flex items-center gap-4 overflow-hidden", isCollapsed && "justify-center px-0")}>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center p-2 shrink-0 shadow-sm">
          <img src="/product-logo.png" alt="SkillSnap" className="w-full h-full object-contain" />
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-lg font-black text-slate-800 leading-none tracking-tight">SkillSnap</h1>
            <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Admin System</p>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto no-scrollbar">
        {NAVIGATION.map((section) => (
          <div key={section.title}>
            {/* Tiêu đề section - Ẩn khi thu gọn */}
            {!isCollapsed ? (
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 animate-in fade-in">
                {section.title}
              </h2>
            ) : (
              <div className="h-4 border-b border-slate-50 mb-4 mx-2" /> // Thay tiêu đề bằng đường kẻ nhẹ khi thu gọn
            )}

            <nav className="space-y-1.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : ""} // Hiện tooltip mặc định của trình duyệt khi thu gọn
                  className={({ isActive }) => cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-bold transition-all group",
                    isCollapsed && "justify-center px-0 w-12 mx-auto", // Căn giữa icon khi thu gọn
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        size={20} 
                        className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} 
                      />
                      {!isCollapsed && (
                        <span className="flex-1 text-left animate-in fade-in slide-in-from-left-2">
                          {item.label}
                        </span>
                      )}

                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer User */}
      <div className="p-4 border-t border-slate-50">
        <div className={cn(
          "bg-slate-50/50 rounded-[1.5rem] flex items-center gap-3 group cursor-pointer transition-all",
          isCollapsed ? "p-2 justify-center" : "p-4"
        )}>
          <div className="w-10 h-10 rounded-full bg-amber-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="avatar" />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in">
              <p className="text-[13px] font-black text-slate-800 truncate">Admin</p>
              <p className="text-[11px] text-slate-400 font-medium truncate italic underline underline-offset-2">{user?.email}</p>
            </div>
          )}
          
          {!isCollapsed && (
            <button 
              onClick={handleLogout}
              className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;