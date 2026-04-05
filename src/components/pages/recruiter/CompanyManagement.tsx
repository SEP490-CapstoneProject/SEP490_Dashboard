import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Briefcase,
  ShieldAlert,
  MapPin,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { allCompanies, Company } from "@/data/allCompaniess";
import { useNavigate } from "react-router-dom";

// --- Types ---
interface Recruiter {
  id: string;
  name: string;
  location: string;
  email: string;
  industry: string;
  status: "Hoạt động" | "Đang chờ duyệt" | "Bị từ chối";
  logoSeed: string;
}

interface PaginationResponse {
  data: Company[];
  totalItems: number;
  totalPages: number;
}

// --- Mock Data Generator (Giả lập Paging ở Backend) ---
const fetchRecruitersFromBackend = async (
  pageNum: number,
  pageSize: number,
): Promise<PaginationResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const start = (pageNum - 1) * pageSize;
  const data = allCompanies.slice(start, start + pageSize);

  return {
    data,
    totalItems: allCompanies.length,
    totalPages: Math.ceil(allCompanies.length / pageSize),
  };
};

const CompanyManagement = () => {
  const [recruiters, setRecruiters] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  const navigate = useNavigate();
  const loadData = async () => {
    setLoading(true);
    const response = await fetchRecruitersFromBackend(currentPage, pageSize);
    setRecruiters(response.data);
    setTotalItems(response.totalItems);
    setTotalPages(response.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentPage]);

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafd] p-8 animate-in fade-in duration-500">
      {/* 1. Header Area */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Quản lý Nhà tuyển dụng
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Theo dõi, phê duyệt và quản lý thông tin các đơn vị doanh nghiệp.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <Plus size={18} /> Thêm nhà tuyển dụng
        </button>
      </div>

      {/* 2. Stats Cards (Dựa theo ảnh mẫu) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-2 border-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Tài khoản chờ duyệt
            </p>
            <h3 className="text-3xl font-black text-slate-800">12</h3>
            <p className="text-[10px] font-bold mt-1 text-orange-500 flex items-center gap-1">
              <Clock size={12} /> Cần xử lý ngay
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center relative">
            <ShieldAlert size={28} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-400">
              <Eye size={14} />
            </div>
          </div>
        </div>

        <StatCard
          label="Tổng số nhà tuyển dụng"
          value="1,250"
          trend="+12.5% so với tháng trước"
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Nhà tuyển dụng mới"
          value="85"
          trend="Trong 30 ngày qua"
          icon={Briefcase}
          color="orange"
        />
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white border-2 border-white shadow-sm rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên công ty hoặc email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <FilterButton label="Trạng thái: Tất cả" />
          <FilterButton label="Lĩnh vực" />
          <button className="px-4 py-3 text-blue-600 text-[13px] font-black hover:bg-blue-50 rounded-xl transition-all">
            Xóa lọc
          </button>
        </div>
      </div>

      {/* 4. Table Area */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-50">
            <tr>
              {[
                "ID",
                "DOANH NGHIỆP",
                "EMAIL",
                "LĨNH VỰC",
                "TRẠNG THÁI",
                "THAO TÁC",
              ].map((head) => (
                <th
                  key={head}
                  className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-20 text-slate-400 font-medium"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              recruiters.map((item) => (
                <tr
                  key={item.companyId}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 text-[13px] font-bold text-slate-400">
                    {item.companyId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-inner overflow-hidden uppercase font-black text-[10px]">
                        <img
                          src={item.avatar}
                          alt="logo"
                        />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-700 leading-tight">
                          {item.companyName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-1 uppercase">
                          <MapPin size={10} /> {item.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                    {item.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      {item.activityField}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-[11px] font-black uppercase tracking-tighter",
                        item.status === "Hoạt động"
                          ? "bg-emerald-50 text-emerald-500"
                          : item.status === "Đang chờ duyệt"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-red-50 text-red-500",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          item.status === "Hoạt động"
                            ? "bg-emerald-500"
                            : item.status === "Đang chờ duyệt"
                              ? "bg-slate-400"
                              : "bg-red-500",
                        )}
                      />
                      {item.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {item.status === "Đang chờ duyệt" ? (
                        <>
                          <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer">
                            <CheckCircle2 size={18} />
                          </button>
                          <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                            <X size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
                            <Eye size={18} onClick={() => navigate(`/dashboard/companies/${item.companyId}`)} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                            <Eye size={18} onClick={() => navigate(`/dashboard/companies/${item.companyId}`)} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
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

        {/* 5. Pagination Area */}
        <div className="px-8 py-6 bg-slate-50/30 flex justify-between items-center border-t border-slate-50">
          <p className="text-[13px] text-slate-400 font-medium">
            Hiển thị{" "}
            <span className="text-slate-700 font-bold">
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            trên tổng số{" "}
            <span className="text-slate-700 font-bold">{totalItems}</span> nhà
            tuyển dụng
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-9 h-9 rounded-xl text-[13px] font-black transition-all",
                  currentPage === i + 1
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:bg-white",
                )}
              >
                {i + 1}
              </button>
            ))}
            {totalPages > 5 && <span className="px-2 text-slate-300">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={cn(
                  "w-9 h-9 rounded-xl text-[13px] font-black transition-all",
                  currentPage === totalPages
                    ? "bg-blue-600 text-white"
                    : "text-slate-400",
                )}
              >
                {totalPages}
              </button>
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white border-2 border-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      <p
        className={cn(
          "text-[10px] font-bold mt-1",
          color === "blue" ? "text-emerald-500" : "text-slate-400",
        )}
      >
        {color === "blue" && <TrendingUp size={12} className="inline mr-1" />}{" "}
        {trend}
      </p>
    </div>
    <div
      className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center",
        color === "blue"
          ? "bg-blue-50 text-blue-600"
          : "bg-orange-50 text-orange-500",
      )}
    >
      <Icon size={28} />
    </div>
  </div>
);

const FilterButton = ({ label }: { label: string }) => (
  <button className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[13px] font-bold flex items-center gap-3 transition-all border border-slate-100/50">
    <Filter size={14} className="text-slate-400" /> {label}
  </button>
);

export default CompanyManagement;
