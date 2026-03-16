import React, { useState, useEffect } from "react";
import {
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Flag,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface CommunityPost {
  id: string;
  author: string;
  content: string;
  reason: string;
  status: "Bị tố cáo" | "Vi phạm";
  avatarColor: string;
}

interface PaginationResponse {
  data: CommunityPost[];
  totalItems: number;
  totalPages: number;
}

// --- Mock Data Backend (Giả lập fetch có Filter & Paging) ---
const fetchPostsFromBackend = async (
  pageNum: number,
  pageSize: number,
  filterTab: string
): Promise<PaginationResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const ALL_MOCK_DATA: CommunityPost[] = [
    { id: "1", author: "Nguyễn Văn A", content: "Chia sẻ lộ trình học React...", reason: "Spam quảng cáo", status: "Bị tố cáo", avatarColor: "bg-blue-100 text-blue-600" },
    { id: "2", author: "Trần Thị B", content: "Cần tìm đối tác làm dự án...", reason: "Nội dung nhạy cảm", status: "Vi phạm", avatarColor: "bg-slate-100 text-slate-600" },
    { id: "3", author: "Lê Văn C", content: "Dịch vụ tăng follow, like, vi...", reason: "Quảng cáo trái phép", status: "Bị tố cáo", avatarColor: "bg-blue-100 text-blue-600" },
    { id: "4", author: "Dương Hoàng", content: "Cách tối ưu SEO cho websi...", reason: "Tố cáo giả mạo", status: "Bị tố cáo", avatarColor: "bg-purple-100 text-purple-600" },
    { id: "5", author: "Phạm Minh Mẫn", content: "Cảnh báo lừa đảo tuyển dụng...", reason: "Nội dung sai lệch", status: "Vi phạm", avatarColor: "bg-red-100 text-red-600" },
  ];

  // Logic Filter tại Backend
  let filtered = ALL_MOCK_DATA;
  if (filterTab !== "Tất cả bài đăng") {
    filtered = ALL_MOCK_DATA.filter((post) => post.status === filterTab);
  }

  // Logic Paging tại Backend
  const start = (pageNum - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
};

const CommunityPostManagement = () => {
  // --- States ---
  const [activeTab, setActiveTab] = useState("Tất cả bài đăng");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 4;

  // --- Effect: Load data khi Page hoặc Tab thay đổi ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await fetchPostsFromBackend(currentPage, pageSize, activeTab);
      setPosts(res.data);
      setTotalItems(res.totalItems);
      setTotalPages(res.totalPages);
      setLoading(false);
    };
    loadData();
  }, [currentPage, activeTab]);

  // Reset về trang 1 khi chuyển Tab
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafd] p-8 animate-in fade-in duration-500">
      {/* 1. Header Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card: Tổng số */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-white flex flex-col justify-between h-40">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tổng số bài đăng</p>
          <h3 className="text-3xl font-black text-slate-800">12,840</h3>
          <p className="text-[10px] font-bold text-blue-500 tracking-wider">+1 bài đăng hôm nay</p>
        </div>

        {/* Card: Vi phạm */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-white flex flex-col justify-between h-40 group">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vi phạm</p>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertCircle size={20} /></div>
          </div>
          <h3 className="text-3xl font-black text-red-500 leading-none">12</h3>
          <p className="text-[10px] font-bold mt-2 text-red-400 flex items-center gap-1">+ 2 vi phạm hôm nay</p>
        </div>

        {/* Card: Bị tố cáo */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-white flex flex-col justify-between h-40 group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Bị tố cáo</p>
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors"><Flag size={20} /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 leading-none">08</h3>
          <p className="text-[10px] font-bold mt-2 text-slate-400 tracking-wider">+1 tố cáo hôm nay</p>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[2.5rem] overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-50 px-8">
          {["Tất cả bài đăng", "Bị tố cáo", "Vi phạm"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "py-5 px-6 text-[13px] font-bold transition-all relative",
                activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
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
                {["TÁC GIẢ", "NỘI DUNG", "LÝ DO", "TRẠNG THÁI", "HÀNH ĐỘNG"].map((h) => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic uppercase text-xs">Đang tải dữ liệu...</td></tr>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px] uppercase", post.avatarColor)}>
                          {post.author.split(" ").map((n) => n[0]).join("").slice(-2)}
                        </div>
                        <span className="text-[14px] font-bold text-slate-700">{post.author}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] text-slate-500 font-medium">{post.content}</td>
                    <td className="px-8 py-5">
                      <span className={cn("px-4 py-1.5 rounded-full text-[11px] font-bold", post.status === "Vi phạm" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600")}>
                        {post.reason}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", post.status === "Vi phạm" ? "bg-red-500" : "bg-amber-500")} />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{post.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                        <button className={cn("p-2 rounded-lg transition-all", post.status === "Vi phạm" ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-red-500 hover:bg-red-50")}><Ban size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">Không có dữ liệu hiển thị.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Backend Style) */}
        <div className="px-8 py-6 bg-slate-50/20 flex justify-between items-center border-t border-slate-50">
          <p className="text-[12px] text-slate-400 font-medium">
            Hiển thị <span className="text-slate-700 font-bold">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)}</span> trên tổng số <span className="text-slate-700 font-bold">{totalItems}</span> bài đăng
          </p>
          <div className="flex items-center gap-1.5">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-20"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[12px] font-black transition-all",
                  currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-white"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPostManagement;