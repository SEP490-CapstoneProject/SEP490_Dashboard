import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
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
  Calendar,
  Download,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

  // --- State phụ trách Khu vực Xuất Báo Cáo & Overlay ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<"month" | "year" | "">("");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

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
    const convertedRevenue = todayRecord
      ? new Intl.NumberFormat("vi-VN").format(todayRecord.revenue * 1000)
      : 0;
    return todayRecord ? `${convertedRevenue}đ` : "0đ (Chưa có)";
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
      value: overview
        ? `${new Intl.NumberFormat("vi-VN").format(overview.totalRevenue * 1000)}đ`
        : "---",
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

  // Mở overlay và gán loại báo cáo cần xuất
  const handleOpenExportModal = (type: "month" | "year") => {
    setReportType(type);
    setIsModalOpen(true);
  };

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!exportStartDate || !exportEndDate) {
      alert("Vui lòng chọn khoảng thời gian!");
      return;
    }

    // 1. Lọc dữ liệu theo khoảng thời gian người dùng đã chọn trong Overlay
    const start = new Date(exportStartDate);
    const end = new Date(exportEndDate);

    const dataToExport = subscriptions.filter((s) => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end;
    });

    if (dataToExport.length === 0) {
      alert("Không có dữ liệu trong khoảng thời gian này để xuất file!");
      return;
    }

    // 2. Format lại dữ liệu để hiển thị đẹp trong Excel
    const excelData = dataToExport.map((s) => ({
      "Mã Đăng Ký": s.id,
      "Tên Người Dùng": s.userName,
      "Gói Dịch Vụ": s.planName,
      "Trạng Thái": s.status === "Active" ? "Hoạt động" : "Khác",
      "Ngày Bắt Đầu": new Date(s.startDate).toLocaleDateString("vi-VN"),
      "Ngày Kết Thúc": new Date(s.endDate).toLocaleDateString("vi-VN"),
      "Ngày Tạo": new Date(s.createdAt).toLocaleDateString("vi-VN"),
    }));

    // 3. Quy trình tạo file Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");

    // 4. Xuất file và tự động tải xuống
    const fileName = `Bao_cao_doanh_thu_${reportType}_${exportStartDate}_den_${exportEndDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    // Đóng modal
    setIsModalOpen(false);
    setExportStartDate("");
    setExportEndDate("");
  };

  // Chuẩn bị dữ liệu cho Chart từ API revenueData của bạn
  const formattedChartData = React.useMemo(() => {
    if (!revenueData?.dailyRevenue) return [];
    return revenueData.dailyRevenue.map((item) => {
      const dateObj = new Date(item.date);
      return {
        // Biến đổi ngày YYYY-MM-DD thành dạng ngắn DD/MM để trục X thanh thoát
        name: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
        "Doanh thu": item.revenue * 1000,
      };
    });
  }, [revenueData]);

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
    <main className="flex-1 p-2 lg:p-9 w-full bg-[#f7eccd] min-h-screen text-slate-900 relative">
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
                    stat.id === "totalRevenue"
                      ? "text-blue-600"
                      : stat.id === "todayRevenue"
                        ? "text-emerald-600"
                        : stat.id === "mrr"
                          ? "text-indigo-600"
                          : "text-violet-600"
                  }`}
                >
                  {stat.id === "todayRevenue" ? (
                    stat.value.includes("0đ") ||
                    stat.value === "Chưa có dữ liệu" ? (
                      <span className="text-sm text-slate-300 font-bold">
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

              {stat.id === "totalRevenue" && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {/* 2. KHU VỰC BIỂU ĐỒ & XUẤT BÁO CÁO (ĐÃ ĐƯỢC TÁCH BIỆT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PHẦN 2A: BIỂU ĐỒ TĂNG TRƯỞNG DOANH THU */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50 min-h-[350px] flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                Biểu đồ tăng trưởng doanh thu
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-1">
                Dữ liệu trực quan dựa trên biến động dòng tiền thực tế
              </p>
            </div>

            <div className="w-full h-[250px]">
              {loadingStats ? (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs uppercase tracking-widest">
                  <Loader2
                    className="animate-spin text-blue-600 mr-2"
                    size={20}
                  />
                  Đang dựng biểu đồ...
                </div>
              ) : formattedChartData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                  Không tìm thấy dữ liệu dòng tiền để hiển thị
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={formattedChartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${new Intl.NumberFormat("vi-VN").format(Number(value))}đ`,
                        "Doanh thu",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="Doanh thu"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* PHẦN 2B: KHU VỰC BUTTON XUẤT BÁO CÁO */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50 min-h-[350px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                Xuất dữ liệu báo cáo
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-1">
                Lựa chọn định dạng kết xuất dữ liệu quản trị
              </p>
            </div>

            <div className="flex flex-col gap-4 my-auto">
              {/* Button Báo cáo theo tháng */}
              <button
                onClick={() => handleOpenExportModal("month")}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Báo cáo doanh thu theo tháng
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Chi tiết biến động luồng tiền theo tháng
                    </p>
                  </div>
                </div>
                <Download
                  size={16}
                  className="text-slate-400 group-hover:text-blue-600 transition-colors"
                />
              </button>

              {/* Button Báo cáo theo năm */}
              <button
                onClick={() => handleOpenExportModal("year")}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Báo cáo doanh thu theo năm
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Tổng hợp cấu trúc tăng trưởng dài hạn
                    </p>
                  </div>
                </div>
                <Download
                  size={16}
                  className="text-slate-400 group-hover:text-indigo-600 transition-colors"
                />
              </button>
            </div>
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
              <div className="flex flex-1 flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <CustomSelect
                  options={statusOptions}
                  value={filters.status}
                  onChange={(val) => setFilters({ ...filters, status: val })}
                  className="w-full md:w-48"
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
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-300 font-black uppercase text-xs tracking-widest">
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
                      colSpan={7}
                      className="py-24 text-center text-slate-400 font-bold"
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
                        <span className="text-xs font-black text-slate-400">
                          #{s.id}
                        </span>
                      </td>
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
                            {s.userName || "Người dùng"}
                          </span>
                        </div>
                      </td>
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

      {/* --- OVERLAY / MODAL CHỌN NGÀY XUẤT BÁO CÁO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden relative p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                  Cấu hình thời gian xuất
                </h4>
                <p className="text-slate-400 text-xs font-bold mt-1">
                  Xuất dữ liệu báo cáo theo{" "}
                  {reportType === "month" ? "Tháng" : "Năm"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form chọn khoảng thời gian */}
            <form onSubmit={handleExportSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Ngày bắt đầu (StartDate)
                </label>
                <input
                  type="date"
                  required
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Ngày kết thúc (EndDate)
                </label>
                <input
                  type="date"
                  required
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                />
              </div>

              {/* Nhóm nút Hành động */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-center font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 border border-slate-200 rounded-2xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-center font-black text-xs uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-100 transition-colors cursor-pointer"
                >
                  Xác nhận xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
