import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hook";
import { formatTimeAgo } from "@/utils/FormatTime";
import { useNavigate } from "react-router-dom";
import { CustomSelect } from "@/components/common/CustomSelect";

// --- Types & Interfaces ---
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
  status: number; 
  reviewReason?: string;
}

interface CompanyReport {
  id: number;
  companyPostId: number;
  postOwnerUserId: number;
  reporterUserId: number;
  reason: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

// --- Maps & Options ---
const REPORT_REASON_MAP: Record<string, string> = {
  spam: "Spam / Tin rác",
  scam: "Lừa đảo / Đa cấp",
  harassment: "Quấy rối / Đả kích",
  inappropriate: "Nội dung không phù hợp",
  other: "Lý do khác",
};

const POST_STATUS_MAP: Record<number, { label: string; class: string }> = {
  0: { label: "Chờ duyệt", class: "bg-amber-50 text-amber-600" },
  1: { label: "Hoạt động", class: "bg-emerald-50 text-emerald-600" },
  2: { label: "Bị ẩn", class: "bg-red-50 text-red-600" },
};

const REPORT_STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Chờ duyệt", value: "Pending" },
  { label: "Vi phạm", value: "Approved" },
  { label: "Bác bỏ", value: "Rejected" },
];

const JobPostManagement = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // --- States ---
  const [activeTab, setActiveTab] = useState("Bài tuyển dụng");
  const [posts, setPosts] = useState<CompanyPostItem[]>([]);
  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats Counters
  const [postsCount, setPostsCount] = useState(0);
  const [_pendingPostsCount, setPendingPostsCount] = useState(0);
  const [todayPostsCount, setTodayPostsCount] = useState(0);
  const [todayReportsCount, setTodayReportsCount] = useState(0);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusPostFilter, _setStatusPostFilter] = useState("all");
  const [statusReportFilter, setStatusReportFilter] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const pageSize = 5;

  const BASE_URL = "https://company-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api";

  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // --- Logic Search Debounce ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- API Handlers: Thống kê ---
  const fetchAllPostsCount = async () => {
    try {
      // FIX SỬA URL: Sửa /admin/company-posts thành /company-posts để tránh lỗi 404
      const response = await fetch(`${BASE_URL}/company-posts?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        const items = data.items || data || [];
        
        if (Array.isArray(items)) {
          setPostsCount(items.length);
          const pendingCount = items.filter((item: any) => item?.status === 0).length;
          setPendingPostsCount(pendingCount);
          const todayCount = items.filter((item: any) => isToday(item?.createdAt)).length;
          setTodayPostsCount(todayCount);
        }
      }
    } catch (error) {
      console.error("Lỗi đếm tổng bài đăng tuyển dụng:", error);
    }
  };

  const fetchAllReportCount = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/company-posts/reports`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        // FIX AN TOÀN: Kiểm tra xem API trả về mảng trực tiếp hay bọc trong data.items
        const reportList = data.items || data || [];
        
        if (Array.isArray(reportList)) {
          setReports(reportList);
          const todayPendingCount = reportList.filter(
            (item: any) => item?.status === "Pending" && isToday(item?.createdAt)
          ).length;
          setTodayReportsCount(todayPendingCount);
        } else {
          setReports([]);
        }
      }
    } catch (error) {
      console.error("Lỗi fetch reports thống kê:", error);
    }
  };

  // --- API Handlers: Khai thác danh sách phân trang ---
  const fetchPosts = async (page: number, _search: string) => {
    setLoading(true);
    try {
      // FIX SỬA URL: Chuyển về đúng endpoint không có admin
      const url = new URL(`${BASE_URL}/company-posts`);
      url.searchParams.append("PageNumber", page.toString());
      url.searchParams.append("PageSize", pageSize.toString());
      
      if (statusPostFilter !== "all") {
        url.searchParams.append("Status", statusPostFilter);
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.items || data || []);
        setHasMorePosts(!!data.hasMore);
      }
    } catch (error) {
      console.error("Lỗi fetch bài tuyển dụng:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (page: number, currentFilter: string) => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/admin/company-posts/reports`);
      url.searchParams.append("PageNumber", page.toString());
      url.searchParams.append("PageSize", pageSize.toString());

      if (currentFilter !== "all") {
        url.searchParams.append("Status", currentFilter);
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        const reportItems = data.items || data || [];
        setReports(Array.isArray(reportItems) ? reportItems : []);
      }
    } catch (error) {
      console.error("Lỗi fetch báo cáo vi phạm:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId: number) => {
    if (!window.confirm("Xác nhận phê duyệt công khai bài tuyển dụng này?")) return;
    try {
      const response = await fetch(`${BASE_URL}/admin/company-posts/${postId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ approverNotes: "Bài tuyển dụng hợp lệ" }),
      });
      if (response.ok) {
        fetchPosts(currentPage, debouncedSearch);
        fetchAllPostsCount();
      }
    } catch (error) {
      console.error("Lỗi duyệt bài:", error);
    }
  };

  const handleRejectPost = async (postId: number) => {
    const reason = window.prompt("Nhập lý do từ chối bài tuyển dụng:");
    if (reason === null) return;
    try {
      const response = await fetch(`${BASE_URL}/admin/company-posts/${postId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason: reason || "Nội dung tuyển dụng không phù hợp" }),
      });
      if (response.ok) {
        fetchPosts(currentPage, debouncedSearch);
        fetchAllPostsCount();
      }
    } catch (error) {
      console.error("Lỗi từ chối bài:", error);
    }
  };

  const handleReviewReport = async (reportId: number, action: "approve_violation" | "reject") => {
    const confirmMsg =
      action === "approve_violation"
        ? "Xác nhận tin tuyển dụng này vi phạm và sẽ tiến hành ẩn khỏi hệ thống?"
        : "Xác nhận bác bỏ đơn tố cáo này?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`${BASE_URL}/admin/company-posts/reports/${reportId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action,
          reviewNote: action === "approve_violation" ? "Vi phạm quy chế tuyển dụng" : "Tố cáo không đúng sự thật",
        }),
      });

      if (response.ok) {
        fetchPosts(currentPage, debouncedSearch);
        fetchReports(currentPage, statusReportFilter);
        fetchAllReportCount();
      }
    } catch (error) {
      console.error("Lỗi xử lý review báo cáo tuyển dụng:", error);
    }
  };

  // --- Effects Kích hoạt Đồng bộ ---
  useEffect(() => {
    fetchAllReportCount();
    fetchAllPostsCount();
  }, []);

  useEffect(() => {
    if (activeTab === "Bài tuyển dụng") {
      fetchPosts(currentPage, debouncedSearch);
    }
  }, [currentPage, debouncedSearch, activeTab, statusPostFilter]);

  useEffect(() => {
    if (activeTab === "Bị tố cáo") {
      fetchReports(currentPage, statusReportFilter);
    }
  }, [currentPage, activeTab, statusReportFilter]);

  // --- Client Filters & Memos Phân trang an toàn ---
  const filteredPosts = useMemo(() => {
    const safePosts = Array.isArray(posts) ? posts : [];
    return safePosts.filter((job) => {
      const companyName = job?.companyName?.toLowerCase() || "";
      const position = job?.position?.toLowerCase() || "";
      const search = debouncedSearch.toLowerCase();
      return companyName.includes(search) || position.includes(search);
    });
  }, [posts, debouncedSearch]);

  const paginatedReports = useMemo(() => {
    const safeReports = Array.isArray(reports) ? reports : [];
    const start = (currentPage - 1) * pageSize;
    return safeReports.slice(start, start + pageSize);
  }, [reports, currentPage]);

  const totalPages = useMemo(() => {
    const safeReports = Array.isArray(reports) ? reports : [];
    if (activeTab === "Bài tuyển dụng") {
      return hasMorePosts ? currentPage + 1 : currentPage;
    }
    return Math.ceil(safeReports.length / pageSize) || 1;
  }, [activeTab, hasMorePosts, currentPage, reports]);
console.log("post:", posts);
console.log("report:", reports);
  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f7eccd] p-4 animate-in fade-in duration-500">
      {/* 1. Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <StatCard
          label="Tổng bài đăng tuyển dụng"
          value={postsCount}
          color="blue"
          icon={FileText}
          subText={`+${todayPostsCount} tin mới đăng hôm nay`}
        />
        <StatCard
          label="Tố cáo chờ duyệt"
          value={reports.length}
          color="amber"
          icon={AlertCircle}
          subText={`+${todayReportsCount} đơn tố cáo mới hôm nay`}
        />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[1.5rem] overflow-hidden">
        {/* Header Table: Tabs & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-50 px-8 py-2 gap-4">
          <div className="flex">
            {["Bài tuyển dụng", "Bị tố cáo"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
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

          <div className="flex flex-col md:flex-row items-center gap-4">
            {activeTab === "Bài tuyển dụng" ? (
              <>
                {/* <CustomSelect
                  options={STATUS_OPTIONS}
                  value={statusPostFilter}
                  onChange={(val) => {
                    setStatusPostFilter(val);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-44"
                /> */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm công ty, vị trí..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </>
            ) : (
              <CustomSelect
                options={REPORT_STATUS_OPTIONS}
                value={statusReportFilter}
                onChange={(val) => {
                  setStatusReportFilter(val);
                  setCurrentPage(1);
                }}
                className="w-full md:w-44"
              />
            )}
          </div>
        </div>

        {/* 3. Table Area */}
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                {activeTab === "Bài tuyển dụng" ? (
                  ["Nhà tuyển dụng", "Vị trí & Hình thức", "Lương công bố", "Ngày đăng", "Trạng thái", "Hành động"].map((h) => (
                    <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))
                ) : (
                  ["ID Tin gốc", "Lý do báo cáo", "Chi tiết mô tả", "Ngày báo cáo", "Trạng thái xử lý", "Hành động"].map((h) => (
                    <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : activeTab === "Bài tuyển dụng" ? (
                filteredPosts.length > 0 ? (
                  filteredPosts.map((job) => {
                    const statusInfo = POST_STATUS_MAP[job?.status] || {
                      label: "N/A",
                      class: "bg-slate-50 text-slate-400",
                    };
                    return (
                      <tr key={job?.postId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img src={job?.companyAvatar || ""} className="w-9 h-9 rounded-xl object-contain border border-slate-100 p-1 bg-slate-50" alt="avatar" />
                            <span className="text-[14px] font-bold text-slate-700">{job?.companyName || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 max-w-md">
                          <div className="flex flex-col text-left">
                            <span className="text-[13px] font-bold text-slate-600">{job?.position || "N/A"}</span>
                            <span className="text-[11px] text-slate-400 font-bold uppercase">{job?.employmentType || "N/A"}</span>
                            {job?.status === 2 && job?.reviewReason && (
                              <span className="text-[10px] text-red-400 italic mt-1 font-medium">Lý do ẩn: {job.reviewReason}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[13px] font-black text-blue-600">
                          {(() => {
                            const parsed = parseInt(job?.salary || "");
                            return isNaN(parsed) ? (job?.salary || "Thỏa thuận") : `${parsed.toLocaleString()}đ`;
                          })()}
                        </td>
                        <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                          {job?.createdAt ? formatTimeAgo(job.createdAt) : "N/A"}
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", statusInfo.class)}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/job-posts/${job?.postId}`)}
                              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            {job?.status === 0 && (
                              <>
                                <button
                                  onClick={() => handleApprovePost(job.postId)}
                                  className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                  title="Phê duyệt"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleRejectPost(job.postId)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                  title="Từ chối"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <EmptyState searchTerm={searchTerm} handleClearSearch={handleClearSearch} />
                )
              ) : paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <tr key={report?.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-[13px] font-bold text-blue-600">#{report?.companyPostId}</td>
                    <td className="px-8 py-5 text-[11px] font-black uppercase">
                      <span className="bg-red-50 text-red-500 px-2 py-1 rounded-md">
                        {REPORT_REASON_MAP[report?.reason] || report?.reason}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[13px] text-slate-500 max-w-[200px] truncate">{report?.description || ""}</td>
                    <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                      {report?.createdAt ? formatTimeAgo(report.createdAt) : "N/A"}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          report?.status === "Pending" && "bg-amber-50 text-amber-500",
                          report?.status === "Approved" && "bg-emerald-50 text-emerald-500",
                          report?.status === "Rejected" && "bg-slate-100 text-slate-400"
                        )}
                      >
                        {report?.status === "Pending" ? "Chờ duyệt" : report?.status === "Approved" ? "Vi phạm" : "Bác bỏ"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/job-posts/${report?.companyPostId}`)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="Xem tin tuyển dụng gốc"
                        >
                          <Eye size={20} />
                        </button>
                        {report?.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleReviewReport(report.id, "approve_violation")}
                              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                              title="Xác nhận vi phạm"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                            <button
                              onClick={() => handleReviewReport(report.id, "reject")}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Bác bỏ tố cáo"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState searchTerm={searchTerm} handleClearSearch={handleClearSearch} />
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Numeric Pagination UI */}
        <div className="px-6 py-5 bg-slate-50/20 flex flex-col md:flex-row justify-between items-center border-t border-slate-50 gap-4">
          <p className="text-[12px] text-slate-400 font-medium">
            Hiển thị trang <span className="text-slate-700 font-bold">{currentPage}</span> trên {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all hover:shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-9 h-9 rounded-xl text-[13px] font-black transition-all",
                  currentPage === i + 1
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:bg-white hover:text-slate-600"
                )}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={
                (activeTab === "Bài tuyển dụng" ? !hasMorePosts : currentPage === totalPages) || loading
              }
              onClick={() => setCurrentPage((p) => p - 1 + 2)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all hover:shadow-sm"
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
const StatCard = ({ label, value, color, icon: Icon, subText }: any) => (
  <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border-2 border-white flex flex-col justify-between h-32 transition-all hover:scale-[1.02]">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        color === "amber" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
      )}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</h3>
      {subText && (
        <p className={cn("text-[10px] font-bold mt-1", color === "amber" ? "text-amber-500/80" : "text-blue-500/80")}>
          {subText}
        </p>
      )}
    </div>
  </div>
);

// --- EmptyState Component ---
const EmptyState = ({ searchTerm, handleClearSearch }: { searchTerm: string; handleClearSearch: () => void }) => (
  <tr>
    <td colSpan={6} className="py-24">
      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Search size={32} className="text-slate-300" />
        </div>
        <h3 className="text-[16px] font-black text-slate-700">Không tìm thấy kết quả</h3>
        <p className="text-[13px] text-slate-400 mt-1 max-w-[280px] text-center leading-relaxed">
          {searchTerm ? (
            <>
              Không tìm thấy tin tuyển dụng nào khớp với từ khóa <span className="font-bold text-slate-600">"{searchTerm}"</span>.
            </>
          ) : (
            "Hiện chưa có dữ liệu hiển thị trong danh sách tuyển dụng này."
          )}
        </p>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="mt-6 px-6 py-2.5 bg-blue-600 text-white text-[12px] font-black uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg cursor-pointer"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        )}
      </div>
    </td>
  </tr>
);

export default JobPostManagement;