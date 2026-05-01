import React, { useEffect, useState } from "react";
import {
  Users,
  History,
  Wallet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Edit,
  CalendarCheck,
} from "lucide-react";
import { useAppSelector } from "@/store/hook";
import {
  AnalyticRevenue,
  AnalyticsOverview,
  Subscription,
} from "@/types/subscription";
import { CustomSelect } from "@/components/common/CustomSelect";

interface StatCardProps {
  id: string;
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  color: string;
}
const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đang hoạt động", value: "Active" },
  { label: "Chờ xử lí", value: "Pending" },
  { label: "Đã hết hạn", value: "Expired" },
  { label: "Đã hủy", value: "Canceled" },
];
const PAGE_SIZE = 5;

const Dashboard: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { accessToken } = useAppSelector((state) => state.auth);

  // --- Pagination & Filters State ---
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [filters, setFilters] = useState({
    userId: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenueData, setRevenueData] = useState<AnalyticRevenue | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchAnalytics = async () => {
    setLoadingStats(true);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };

      // Gọi cả 2 API cùng lúc
      const [resOverview, resRevenue] = await Promise.all([
        fetch(
          "https://subscription-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/admin/analytics/overview",
          { headers },
        ),
        fetch(
          "https://subscription-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/admin/analytics/revenue",
          { headers },
        ),
      ]);

      const dataOverview = await resOverview.json();
      const dataRevenue = await resRevenue.json();

      setOverview(dataOverview);
      setRevenueData(dataRevenue);
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getTodayRevenue = () => {
    if (!revenueData?.dailyRevenue) return "Chưa có dữ liệu";

    const todayStr = new Date().toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
    const todayRecord = revenueData.dailyRevenue.find(
      (item) => item.date.split("T")[0] === todayStr,
    );
    const convertedRevenue = todayRecord ? new Intl.NumberFormat('vi-VN').format(todayRecord.revenue * 1000) : 0;
    return todayRecord
      ? `${convertedRevenue}đ`
      : "0đ (Chưa có)";
  };
  const getTodayNewUserRegister = () => {
    if (!subscriptions) return "Chưa có dữ liệu";
    const todayStr = new Date().toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
    const todayCount = subscriptions.filter(
      (s) => s.createdAt.split("T")[0] === todayStr,
    ).length;
    return `+ ${todayCount} hôm nay`;
  };

  // Mảng stats được tính toán dựa trên dữ liệu từ overview state
  const stats: StatCardProps[] = [
    {
      id: "totalRevenue",
      title: "TỔNG DOANH THU",
      value: overview ? `${new Intl.NumberFormat('vi-VN').format(overview.totalRevenue * 1000)}đ` : "---",
      trend: "",
      icon: <Wallet size={18} />,
      color: "bg-blue-600",
    },
    {
      id: "todayRevenue",
      title: "DOANH THU HÔM NAY",
      value: getTodayRevenue(),
      trend: new Date().toLocaleDateString("en"),
      icon: <CalendarCheck size={18} />,
      color: "bg-emerald-500",
    },
    {
      id: "mrr",
      title: "DOANH THU THÁNG NÀY",
      value: overview
        ? `${new Intl.NumberFormat("vi-VN").format(overview.mrr * 1000)}đ`
        : "---",
      trend: "Thu nhập định kỳ",
      icon: <History size={18} />,
      color: "bg-indigo-600",
    },
    {
      id: "activeSubscriptions",
      title: "ĐĂNG KÝ THÀNH CÔNG",
      value: overview ? `${overview.activeSubscriptions}` : "---",
      trend: getTodayNewUserRegister(),
      icon: <Users size={18} />,
      color: "bg-violet-600",
    },
  ];

  // --- API Handlers ---
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append("UserId", filters.userId);
      if (filters.status) params.append("Status", filters.status);
      if (filters.startDate) params.append("StartDate", filters.startDate);
      if (filters.endDate) params.append("EndDate", filters.endDate);

      params.append("PageNumber", String(pageNumber));
      params.append("PageSize", String(PAGE_SIZE));

      const response = await fetch(
        `https://subscription-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/admin/subscriptions?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await response.json();
      setSubscriptions(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setPageNumber(1);
  }, [filters]);

  // Fetch lại dữ liệu khi trang hoặc filter thay đổi
  useEffect(() => {
    fetchSubscriptions();
    fetchAnalytics();
  }, [pageNumber, filters]);

  return (
    <main className="flex-1 p-2 lg:p-9 w-full bg-[#f7eccd] min-h-screen text-slate-900">
      <div className="space-y-10 w-full">
        {/* 1. Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-[2rem] bg-white shadow-sm border border-slate-50 relative overflow-hidden transition-all hover:scale-[1.03] group"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all ${
                      stat.id === "activeSubscriptions"
                        ? "bg-green-50 text-green-600 border border-green-100 shadow-sm shadow-green-50"
                        : "text-slate-400"
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>
              </div>

              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.title}
              </h4>

              {loadingStats ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md"></div>
              ) : (
                <p
                  className={`text-2xl font-black tracking-tighter truncate ${
                    // 1. TỔNG DOANH THU: Dùng màu Indigo đậm sang chảnh
                    stat.id === "totalRevenue"
                      ? "text-blue-600"
                      : // 2. DOANH THU HÔM NAY: Dùng màu Xanh lá (tượng trưng cho tiền tươi mới về)
                        stat.id === "todayRevenue"
                        ? "text-emerald-600"
                        : // 3. DOANH THU THÁNG (MRR): Dùng màu Blue đặc trưng của tài chính
                          stat.id === "mrr"
                          ? "text-indigo-600"
                          : // 4. CÁC SỐ LƯỢNG (Active Subs): Dùng màu Slate đậm nguyên bản
                            "text-violet-600"
                  }`}
                >
                  {stat.id === "todayRevenue" ? (
                    stat.value.includes("0 VND") ||
                    stat.value === "Chưa có dữ liệu" ? (
                      <span className="text-sm text-slate-300 font-bold italic">
                        Chưa có doanh thu hôm nay
                      </span>
                    ) : (
                      `+ ${stat.value}`
                    )
                  ) : (
                    stat.value
                  )}
                </p>
              )}

              {/* Hiệu ứng tia sáng nhẹ cho các card tiền tệ lớn */}
              {stat.id === "totalRevenue" && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {/* 2. Charts Mockup (Giữ nguyên spacing) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[1.5rem] shadow-sm border border-slate-50 min-h-[300px] flex items-center justify-center text-slate-300 font-bold">
            Biểu đồ tăng trưởng doanh thu
          </div>
          <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-slate-50 min-h-[300px] flex items-center justify-center text-slate-300 font-bold ">
            Phân tích tỷ lệ rời bỏ
          </div>
        </div>

        {/* 3. Subscribed Users Table with Paging */}
        <section className="bg-white rounded-[1.5rem] shadow-sm border border-slate-50 overflow-hidden">
          {/* Table Header & Filters */}
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" /> Quản lý đăng ký
                gói
              </h3>
              <button
                onClick={fetchSubscriptions}
                className="p-2 text-slate-400 hover:text-blue-600 transition-all"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full">
              {/* Nhóm các Input/Select bên trái */}
              <div className="flex flex-1 flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <CustomSelect
                  options={statusOptions}
                  value={filters.status}
                  onChange={(val) => setFilters({ ...filters, status: val })}
                  className="w-full md:w-48" // Cố định độ rộng trên desktop cho gọn
                />

                <input
                  type="date"
                  className="w-full md:w-auto px-4 py-3 bg-slate-50 rounded-2xl border-none text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />

                <input
                  type="date"
                  className="w-full md:w-auto px-4 py-3 bg-slate-50 rounded-2xl border-none text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>

              {/* Nút Làm mới được đẩy sang phải nhờ flex-shrink-0 hoặc cấu trúc cha flex */}
              <button
                onClick={() =>
                  setFilters({
                    userId: "",
                    status: "",
                    startDate: "",
                    endDate: "",
                  })
                }
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest cursor-pointer whitespace-nowrap"
              >
                <RefreshCcw size={14} /> Làm mới
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    ID
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Người dùng
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Gói
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Trạng thái
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Ngày bắt đầu
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Ngày kết thúc
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-300 font-black  uppercase text-xs tracking-widest">
                        <Loader2
                          className="animate-spin text-blue-600"
                          size={32}
                        />
                        Đang tải dữ liệu...
                      </div>
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-24 text-center text-slate-400 font-bold "
                    >
                      Không tìm thấy bản ghi nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-blue-50/30 transition-colors group cursor-default"
                    >
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-slate-400 ">
                          #{s.id}
                        </span>
                      </td>

                      {/* Cột 3: Username và UserId */}
                      <td className="px-8 py-6">
                        <div className="flex flex-row items-center gap-3">
                          <img
                            src={
                              s.userAvatar ||
                              `https://ui-avatars.com/api/?name=${s.userName}&background=ebefff&color=2563eb`
                            }
                            alt={s.userName}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover inline-block"
                          />
                          <span className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">
                            {s.userName || "Người dùng "}
                          </span>
                        </div>
                      </td>

                      {/* Các cột Plan, Status, Date giữ nguyên như code trước của Vinh */}
                      <td className="px-8 py-6">
                        {s.planName === "Pro" && (
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-md shadow-blue-100">
                            {s.planName}
                          </span>
                        )}
                        {s.planName === "Premium" && (
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-yellow-600 text-white shadow-md shadow-blue-100">
                            {s.planName}
                          </span>
                        )}
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              s.status === "Active"
                                ? "bg-green-500 animate-pulse"
                                : s.status === "Pending"
                                  ? "bg-blue-500"
                                  : s.status === "Expired"
                                    ? "bg-orange-400"
                                    : "bg-red-500"
                            }`}
                          ></div>
                          <span
                            className={`text-[11px] font-black uppercase tracking-tighter ${
                              s.status === "Active"
                                ? "text-green-600"
                                : s.status === "Pending"
                                  ? "text-blue-600"
                                  : s.status === "Expired"
                                    ? "text-orange-500"
                                    : "text-red-600"
                            }`}
                          >
                            {s.status === "Active"
                              ? "Hoạt động"
                              : s.status === "Pending"
                                ? "Chờ xử lý"
                                : s.status === "Expired"
                                  ? "Hết hạn"
                                  : "Đã hủy"}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-xs font-bold text-slate-500">
                        {new Date(s.startDate).toLocaleDateString("en")}
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-500">
                        {new Date(s.endDate).toLocaleDateString("en")}
                      </td>

                      <td className="px-8 py-6 text-center">
                        <button className="p-2 text-yellow-500 hover:text-yellow-600 cursor-pointer">
                          <Edit size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Trang hiện tại:{" "}
              <span className="text-blue-600">{pageNumber}</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                disabled={pageNumber === 1 || loading}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
              >
                <ChevronLeft size={16} /> Trước
              </button>

              <button
                onClick={() => setPageNumber((prev) => prev + 1)}
                disabled={subscriptions.length < PAGE_SIZE || loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-100 cursor-pointer"
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
