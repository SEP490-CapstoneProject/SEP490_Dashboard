import { useState, useEffect } from "react";
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

// --- Types khớp với Swagger Response ---
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
  // --- States ---
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [jobs, setJobs] = useState<CompanyPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Cursor states
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]); // Lưu lịch sử cursor để "Back"

  const { accessToken } = useAppSelector((state) => state.auth);
  const pageSize = 5;

  // --- Core Fetch Logic ---
  const loadData = async (
    targetCursor: string | null,
    isMovingBack: boolean = false,
  ) => {
    setLoading(true);
    try {
      const url = new URL(
        "https://company-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/company-posts",
      );
      url.searchParams.append("limit", pageSize.toString());
      if (targetCursor) {
        url.searchParams.append("cursor", targetCursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const res: ApiResponse = await response.json();
        setJobs(res.items);
        setNextCursor(res.nextCursor);
        setCurrentCursor(targetCursor);
        console.log("Fetched Data:", res.items);
        // Nếu là đi tới trang mới (không phải Back), lưu cursor cũ vào stack
        if (!isMovingBack && targetCursor !== currentCursor) {
          // Chỉ thêm vào stack nếu thực sự đổi trang
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset về trang đầu khi đổi Tab
  useEffect(() => {
    setCursorStack([]);
    const delayDebounceFn = setTimeout(() => {
      loadData(null);
    }, 500); // Debounce 500ms để tránh gọi API liên tục khi gõ chữ

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchTerm]);

  // --- Navigation Handlers ---
  const handleNext = () => {
    if (nextCursor && !loading) {
      setCursorStack((prev) => [...prev, currentCursor]); // Lưu trang hiện tại vào stack
      loadData(nextCursor);
    }
  };

  const handleBack = () => {
    if (cursorStack.length > 0 && !loading) {
      const prevCursor = cursorStack[cursorStack.length - 1];
      setCursorStack((prev) => prev.slice(0, -1)); // Xóa cursor cuối khỏi stack
      loadData(prevCursor, true);
    }
  };
  const filteredJobs = jobs.filter((job) =>
    job.companyName.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="flex-1 min-h-screen bg-[#f7eccd] p-2 animate-in fade-in duration-500">
      {/* 1. Stats Cards Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
        <StatCard
          label="Tổng bài đăng"
          value="1,250"
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Chờ duyệt"
          value="45"
          icon={Clock}
          color="orange"
          isAlert
        />
        <StatCard label="Vi phạm" value="12" icon={AlertCircle} color="red" />
        <StatCard label="Bị tố cáo" value="08" icon={Flag} color="slate" />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[2rem] overflow-hidden">
        {/* Header Table: Tab + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 px-8 py-2 gap-4">
          <div className="flex">
            {["Tất cả", "Bị tố cáo", "Vi phạm"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-5 px-6 text-[13px] font-bold transition-all relative cursor-pointer",
                  activeTab === tab
                    ? "text-blue-600"
                    : "text-slate-400 hover:text-slate-600",
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Nhà tuyển dụng
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Vị trí
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Lương
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Ngày đăng
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Trạng thái
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin" />
                      <span className="text-xs font-bold uppercase">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    Không có bài viết nào.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job.postId}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.companyAvatar}
                          className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 object-contain p-1"
                          alt="logo"
                        />
                        <span className="text-[14px] font-bold text-slate-700">
                          {job.companyName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[13px] font-bold text-slate-600">
                        {job.position}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {job.employmentType}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] font-black text-blue-600">
                      {parseInt(job.salary).toLocaleString()}đ
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">
                      {formatTimeAgo(job.createdAt)}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-500">
                        Đang hoạt động
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          onClick={() =>
                            navigate(`/dashboard/job-posts/${job.postId}`)
                          }
                        >
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Ban size={18} />
                        </button>
                        {/* {job.status === "CHỜ DUYỆT" ? (

                          <>

                            <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle2 size={18} /></button>

                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><XCircle size={18} /></button>

                            <button className="p-2 text-slate-400 hover:text-blue-500"><Eye size={18} /></button>

                          </> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Cursor-Based Pagination UI */}
        <div className="px-8 py-2 bg-slate-50/20 flex justify-between items-center border-t border-slate-50">
          <p className="text-[12px] text-slate-400 font-medium">
            Trang hiện tại:{" "}
            <span className="text-slate-700 font-bold">
              {cursorStack.length + 1}
            </span>
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={cursorStack.length === 0 || loading}
              className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} /> Trang trước
            </button>

            <button
              onClick={handleNext}
              disabled={!nextCursor || loading}
              className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Trang sau <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const StatCard = ({ label, value, icon: Icon, color, isAlert }: any) => (
  <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border-2 border-white flex flex-col justify-between h-30 group">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center",
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
      {isAlert && (
        <p className="text-[10px] font-bold mt-2 text-orange-400 tracking-wider uppercase">
          Cần xử lý ngay
        </p>
      )}
    </div>
  </div>
);

export default JobPostManagement;
