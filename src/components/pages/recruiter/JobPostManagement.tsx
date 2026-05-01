import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  AlertCircle,
  Flag,
  Loader2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hook";
import { formatTimeAgo } from "@/utils/FormatTime";
import { useNavigate } from "react-router-dom";

// --- Types ---
interface CompanyPostItem {
  postId: number;
  position: string;
  companyName: string;
  companyAvatar: string;
  coverImageUrl: string | null;
  mediaType: string;
  mediaUrl: string;
  address: string;
  salary: string;
  employmentType: string;
  createdAt: string;
  isSaved: boolean;
}

interface ApiResponse {
  items: CompanyPostItem[];
  nextCursor: string | null;
}

const JobPostManagement = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // --- States ---
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [allJobs, setAllJobs] = useState<CompanyPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- Core Fetch Logic: Vét cạn dữ liệu ---
  const fetchAllJobs = async () => {
    setLoading(true);
    let collectedJobs: CompanyPostItem[] = [];
    let nextCursor: string | null = null;
    let hasMore = true;
    const LIMIT = 50; // Tăng limit mỗi lần fetch để vét nhanh hơn

    try {
      while (hasMore) {
        const url = new URL(
          "https://company-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/company-posts"
        );
        url.searchParams.append("limit", LIMIT.toString());
        if (nextCursor) url.searchParams.append("cursor", nextCursor);

        const response = await fetch(url.toString(), {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const res: ApiResponse = await response.json();
          const items = res.items || [];
          if (items.length === 0) break;

          collectedJobs = [...collectedJobs, ...items];
          nextCursor = res.nextCursor;

          if (!nextCursor || items.length < LIMIT) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      setAllJobs(collectedJobs);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, [activeTab]);

  // --- Logic Xử lý Dữ liệu tại Client (Filter & Paging) ---
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // Kiểm tra an toàn để tránh lỗi khi dữ liệu trả về null/undefined
      const companyName = job?.companyName?.toLowerCase() || "";
      const position = job?.position?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      return companyName.includes(search) || position.includes(search);
    });
  }, [allJobs, searchTerm]);

  // Luôn reset về trang 1 khi người dùng gõ tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = filteredJobs.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    // Đảm bảo không bị lỗi slice trên mảng undefined
    return (filteredJobs || []).slice(startIndex, startIndex + pageSize);
  }, [filteredJobs, currentPage]);

  return (
    <div className="flex-1 min-h-screen bg-[#f7eccd] p-2 animate-in fade-in duration-500">
      {/* 1. Stats Cards Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
        <StatCard label="Tổng bài đăng" value={allJobs.length.toLocaleString()} icon={FileText} color="blue" />
        <StatCard label="Chờ duyệt" value="45" icon={Clock} color="orange" isAlert />
        <StatCard label="Vi phạm" value="12" icon={AlertCircle} color="red" />
        <StatCard label="Bị tố cáo" value="08" icon={Flag} color="slate" />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[2rem] overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 px-8 py-2 gap-4">
          <div className="flex">
            {["Tất cả", "Bị tố cáo", "Vi phạm"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-5 px-6 text-[13px] font-bold transition-all relative cursor-pointer",
                  activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm công ty, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                {["Nhà tuyển dụng", "Vị trí", "Lương", "Ngày đăng", "Trạng thái", "Hành động"].map((h) => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin" />
                      <span className="text-xs font-bold uppercase">Đang đồng bộ dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">Không tìm thấy bài viết nào.</td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.postId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <img src={job.companyAvatar} className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 object-contain p-1" alt="logo" />
                        <span className="text-[14px] font-bold text-slate-700">{job.companyName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[13px] font-bold text-slate-600">{job.position}</div>
                      <div className="text-[11px] text-slate-400">{job.employmentType}</div>
                    </td>
                    <td className="px-8 py-5 text-[13px] font-black text-blue-600">
                      {job.salary ? parseInt(job.salary).toLocaleString() : 0}đ
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">{formatTimeAgo(job.createdAt)}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-500">Hoạt động</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          onClick={() => navigate(`/dashboard/job-posts/${job.postId}`)}
                        >
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Ban size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Numeric Pagination (Style mới) */}
        <div className="px-8 py-5 bg-slate-50/20 flex flex-col md:flex-row justify-between items-center border-t border-slate-50 gap-4">
          <p className="text-[12px] text-slate-400 font-medium">
            Hiển thị <span className="text-slate-700 font-bold">{paginatedJobs.length}</span> trên <span className="text-slate-700 font-bold">{totalItems}</span> bài tuyển dụng
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-9 h-9 rounded-xl text-[13px] font-black transition-all",
                      currentPage === page ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-white"
                    )}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="text-slate-300">...</span>;
              return null;
            })}

            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- StatCard Component ---
const StatCard = ({ label, value, icon: Icon, color, isAlert }: any) => (
  <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border-2 border-white flex flex-col justify-between h-30 group">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center",
        color === "blue" ? "bg-blue-50 text-blue-500" :
        color === "orange" ? "bg-orange-50 text-orange-500" :
        color === "red" ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400",
      )}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      {isAlert && <p className="text-[10px] font-bold mt-2 text-orange-400 tracking-wider uppercase">Cần xử lý ngay</p>}
    </div>
  </div>
);

export default JobPostManagement;