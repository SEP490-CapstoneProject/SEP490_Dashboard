import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { DashboardHeader } from "./Header";

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader /> {/* Thêm Header vào đây */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
