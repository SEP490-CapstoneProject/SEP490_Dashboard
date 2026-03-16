import React, { useState, useEffect } from "react";
import {
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Contact2,
  Clock,
  AlertCircle,
  Flag,
  RotateCcw,
  Filter,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface Portfolio {
  id: string;
  userName: string;
  avatarSeed: string;
  field: string;
  createdAt: string;
  status: "CHỜ DUYỆT" | "ĐÃ DUYỆT" | "VI PHẠM" | "BỊ TỐ CÁO";
}

interface PaginationResponse {
  data: Portfolio[];
  totalItems: number;
  totalPages: number;
}

// --- Mock Data Backend ---
const fetchPortfoliosFromBackend = async (
  pageNum: number,
  pageSize: number,
  filterTab: string,
): Promise<PaginationResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const ALL_PORTFOLIOS: Portfolio[] = [
    {
      id: "#PF-8842",
      userName: "Nguyễn Văn A",
      avatarSeed: "A",
      field: "UI/UX Designer",
      createdAt: "20/10/2023",
      status: "CHỜ DUYỆT",
    },
    {
      id: "#PF-8721",
      userName: "Trần Thị B",
      avatarSeed: "B",
      field: "Graphic Design",
      createdAt: "18/10/2023",
      status: "ĐÃ DUYỆT",
    },
    {
      id: "#PF-8655",
      userName: "Lê Văn C",
      avatarSeed: "C",
      field: "Frontend Dev",
      createdAt: "15/10/2023",
      status: "VI PHẠM",
    },
    {
      id: "#PF-8512",
      userName: "Phạm Minh D",
      avatarSeed: "D",
      field: "Photographer",
      createdAt: "12/10/2023",
      status: "BỊ TỐ CÁO",
    },
    {
      id: "#PF-8400",
      userName: "Hoàng Anh",
      avatarSeed: "H",
      field: "Fullstack Dev",
      createdAt: "10/10/2023",
      status: "ĐÃ DUYỆT",
    },
  ];

  let filtered = ALL_PORTFOLIOS;
  if (filterTab !== "Tất cả") {
    filtered = ALL_PORTFOLIOS.filter(
      (p) => p.status.toLowerCase() === filterTab.toLowerCase(),
    );
  }

  const start = (pageNum - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
};

const PortfolioManagement = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 4;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await fetchPortfoliosFromBackend(
        currentPage,
        pageSize,
        activeTab,
      );
      setPortfolios(res.data);
      setTotalItems(res.totalItems);
      setTotalPages(res.totalPages);
      setLoading(false);
    };
    loadData();
  }, [currentPage, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafd] p-8 animate-in fade-in duration-500">
      {/* 1. Header Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Tổng số hồ sơ"
          value="1,250"
          trend="+12% tháng này"
          icon={Contact2}
          color="blue"
        />
        <StatCard
          label="Hồ sơ chờ duyệt"
          value="45"
          icon={Clock}
          color="orange"
          isAlert
        />
        <StatCard
          label="Vi phạm"
          value="12"
          subValue="Cần xử lý ngay"
          icon={AlertCircle}
          color="red"
        />
        <StatCard label="Bị tố cáo" value="08" icon={Flag} color="slate" />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[2rem] overflow-hidden">
        {/* Title & Filter Header */}
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Danh sách hồ sơ Portfolio
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-50 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={16} /> Lọc dữ liệu
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-50 px-8 mt-4">
          {["Tất cả", "Chờ duyệt", "Vi phạm", "Bị tố cáo"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "py-5 px-6 text-[13px] font-bold transition-all relative",
                activeTab === tab
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-left-2" />
              )}
            </button>
          ))}
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                {[
                  "PORTFOLIO ID",
                  "NGƯỜI DÙNG",
                  "LĨNH VỰC",
                  "NGÀY TẠO",
                  "TRẠNG THÁI",
                  "HÀNH ĐỘNG",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-slate-400 font-bold italic text-xs uppercase"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : (
                portfolios.map((pf) => (
                  <tr
                    key={pf.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">
                      {pf.id}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[11px] text-slate-500 border border-slate-200 uppercase">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pf.avatarSeed}`}
                            alt="avt"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <span className="text-[14px] font-bold text-slate-700">
                          {pf.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] text-slate-500 font-medium">
                      {pf.field}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">
                      {pf.createdAt}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                          pf.status === "ĐÃ DUYỆT"
                            ? "bg-emerald-50 text-emerald-500"
                            : pf.status === "CHỜ DUYỆT"
                              ? "bg-slate-100 text-slate-500"
                              : pf.status === "VI PHẠM"
                                ? "bg-red-50 text-red-500"
                                : "bg-orange-50 text-orange-500",
                        )}
                      >
                        {pf.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1">
                        {pf.status === "CHỜ DUYỆT" ? (
                          <>
                            <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                              <CheckCircle2 size={18} />
                            </button>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <XCircle size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-blue-500">
                              <Eye size={18} />
                            </button>
                          </>
                        ) : pf.status === "BỊ TỐ CÁO" ? (
                          <>
                            <button className="p-2 text-slate-400 hover:text-blue-500">
                              <Eye size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-blue-600">
                              <RotateCcw size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                              <Ban size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                              <Eye size={18} />
                            </button>
                            <button
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                pf.status === "VI PHẠM"
                                  ? "text-red-500 bg-red-50"
                                  : "text-slate-400 hover:text-red-500 hover:bg-red-50",
                              )}
                            >
                              <Ban size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-slate-50/20 flex justify-between items-center border-t border-slate-50">
          <p className="text-[12px] text-slate-400 font-medium">
            Hiển thị{" "}
            <span className="text-slate-700 font-bold">
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            trong tổng số{" "}
            <span className="text-slate-700 font-bold">{totalItems}</span> hồ sơ
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[12px] font-black transition-all",
                  currentPage === i + 1
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:bg-white",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-300 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Stat Card ---
const StatCard = ({
  label,
  value,
  trend,
  subValue,
  icon: Icon,
  color,
  isAlert,
}: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-white flex flex-col justify-between h-44">
    <div className="flex justify-between items-start">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          color === "blue"
            ? "bg-blue-50 text-blue-500"
            : color === "orange"
              ? "bg-orange-50 text-orange-500"
              : color === "red"
                ? "bg-red-50 text-red-500"
                : "bg-slate-50 text-slate-400",
        )}
      >
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      {trend && (
        <p className="text-[10px] font-bold mt-1 text-emerald-500 flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </p>
      )}
      {subValue && (
        <p className="text-[10px] font-bold mt-1 text-red-400">{subValue}</p>
      )}
      {isAlert && (
        <p className="text-[10px] font-bold mt-1 text-orange-400 uppercase tracking-widest">
          Cần xử lý ngay
        </p>
      )}
    </div>
  </div>
);

export default PortfolioManagement;
