import { useState } from 'react';
import { 
  Users, DollarSign, TrendingDown, Calendar, 
  Activity,  UserMinus, CreditCard
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const StatisticPage = () => {
  const [dateRange, setDateRange] = useState({ start: '2026-03-01', end: '2026-04-15' });
//   const [loading, setLoading] = useState(false);

  // Dữ liệu mẫu từ API bạn cung cấp
  const overview = { totalUsers: 2, activeSubscriptions: 0, totalRevenue: 0, churnRate: 0, mrr: 0, arr: 0 };
  const revenueData = { totalRevenue: 0, revenueByPlan: {} };
  const churnData = { churnRate: 0, churnedUsers: 0 };
    const handleDateChange = () => {
        setDateRange({ start: '2026-03-01', end: '2026-04-15' });
    }
  return (
    <div className="p-6 bg-[#f8fafd] min-h-screen font-sans text-slate-900" onClick={() => handleDateChange}>
      
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">Báo cáo hệ thống</h1>
          <p className="text-slate-500 text-sm font-medium">Quản lý doanh thu và người dùng</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <Calendar size={18} className="text-slate-400" />
          <input type="date" value={dateRange.start} className="border-none focus:ring-0 text-sm font-bold bg-transparent cursor-pointer" />
          <span className="text-slate-300">→</span>
          <input type="date" value={dateRange.end} className="border-none focus:ring-0 text-sm font-bold bg-transparent cursor-pointer" />
        </div>
      </div>

      {/* 1. Hàng Stat Cards chính (Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Tổng người dùng" value={overview.totalUsers} subValue="Người dùng đăng ký" icon={Users} color="blue" />
        <StatCard label="Doanh thu (MRR)" value={`$${overview.mrr}`} subValue="Doanh thu hàng tháng" icon={DollarSign} color="emerald" />
        <StatCard label="Tỷ lệ rời bỏ" value={`${overview.churnRate}%`} subValue="Churn Rate" icon={TrendingDown} color="red" />
        <StatCard label="Doanh thu năm (ARR)" value={`$${overview.arr}`} subValue="Dự báo 12 tháng" icon={Activity} color="indigo" />
      </div>

      {/* 2. Hàng chi tiết Revenue & Churn (Thay thế cho Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bảng Chi tiết doanh thu theo gói */}
        <div className="bg-white rounded-[2rem] shadow-sm border-2 border-white p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CreditCard size={16} /> Phân bổ theo gói (Plans)
            </h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">LIVE DATA</span>
          </div>
          
          <div className="space-y-4">
            {Object.keys(revenueData.revenueByPlan).length > 0 ? (
              // Map data ở đây
              null
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl">
                 <p className="text-slate-400 text-sm italic">Chưa có dữ liệu thanh toán trong kỳ này</p>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách Churn/Rời bỏ */}
        <div className="bg-white rounded-[2rem] shadow-sm border-2 border-white p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <UserMinus size={16} /> Biến động người dùng (Churn)
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Số người đã hủy</p>
              <p className="text-2xl font-black text-slate-800">{churnData.churnedUsers}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tỷ lệ mất khách</p>
              <p className="text-2xl font-black text-red-500">{churnData.churnRate}%</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-400 leading-relaxed italic">
            * Tỷ lệ Churn được tính dựa trên số người dùng hủy gói so với tổng số người dùng trong khoảng thời gian đã chọn.
          </p>
        </div>

      </div>
    </div>
  );
};

// Component StatCard tái sử dụng
const StatCard = ({ label, value, subValue, icon: Icon, color }: any) => {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-white flex flex-col justify-between h-44 group hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colorMap[color])}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
          {subValue}
        </p>
      </div>
    </div>
  );
};