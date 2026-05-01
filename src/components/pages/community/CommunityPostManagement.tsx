import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Flag,
  Loader2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hook";
import { CommunityPost } from "@/types/community";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "@/utils/FormatTime";

const CommunityPostManagement = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // --- States ---
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]); // Lưu trữ toàn bộ dữ liệu đã fetch
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const pageSize = 5; // Số lượng bài viết hiển thị trên mỗi trang

  // --- Core Fetch Logic: Vét cạn dữ liệu từ API Cursor-based ---
  const fetchAllData = async () => {
    setLoading(true);
    let collectedPosts: CommunityPost[] = [];
    let nextCursor: number | null = null;
    let hasMore = true;
    const API_FETCH_BATCH_SIZE = 50; // Lấy mỗi lần 50 bản ghi để tối ưu tốc độ

    try {
      while (hasMore) {
        const url = new URL(
          "https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/community/posts"
        );
        url.searchParams.append("pageSize", API_FETCH_BATCH_SIZE.toString());
        if (nextCursor) {
          url.searchParams.append("cursor", nextCursor.toString());
        }

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const res = await response.json();
          const items = res.items || res;

          if (!items || items.length === 0) {
            hasMore = false;
            break;
          }

          collectedPosts = [...collectedPosts, ...items];
          
          // Lấy ID của bài viết cuối cùng để làm cursor tiếp theo
          nextCursor = items[items.length - 1].id;

          // Nếu số lượng trả về ít hơn batch size, nghĩa là đã hết dữ liệu
          if (items.length < API_FETCH_BATCH_SIZE) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      setAllPosts(collectedPosts);
    } catch (error) {
      console.error("Lỗi fetch toàn bộ dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tải lại dữ liệu khi tab thay đổi
  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  // --- Logic Xử lý Dữ liệu tại Client (Filter & Paging) ---
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) =>
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPosts, searchTerm]);

  const totalItems = filteredPosts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPosts.slice(startIndex, startIndex + pageSize);
  }, [filteredPosts, currentPage]);

  // Reset về trang 1 khi người dùng tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetail = (postId: number) => {
    navigate(`/dashboard/community-posts/${postId}`);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f7eccd] p-2 animate-in fade-in duration-500">
      {/* 1. Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <StatCard
          label="Tổng bài đăng"
          value={allPosts.length.toLocaleString()}
          color="blue"
          icon={Flag}
        />
        <StatCard
          label="Vi phạm"
          value="12"
          color="red"
          icon={AlertCircle}
          isAlert
        />
        <StatCard label="Bị tố cáo" value="08" color="amber" icon={Flag} />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[1rem] overflow-hidden">
        {/* Tab Switcher & Search */}
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
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm tác giả hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* 3. Table Area */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                {["TÁC GIẢ", "NỘI DUNG", "NGÀY TẠO", "TRẠNG THÁI", "HÀNH ĐỘNG"].map((h) => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin" />
                      <span className="text-xs font-bold uppercase">Đang đồng bộ dữ liệu hệ thống...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPosts.length > 0 ? (
                paginatedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt="avatar"
                          className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                        />
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-slate-700">{post.author.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{post.author.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] text-slate-500 font-medium max-w-md">
                      <p className="line-clamp-2">{post.description}</p>
                    </td>
                    <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                      {formatTimeAgo(post.createdAt)}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-500 uppercase">
                        Hoạt động
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          onClick={() => handleViewDetail(post.id)}
                        >
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">Không có bài đăng nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Numeric Pagination UI (Style UserManagement) */}
        <div className="px-6 py-5 bg-slate-50/20 flex flex-col md:flex-row justify-between items-center border-t border-slate-50 gap-4">
          <p className="text-[12px] text-slate-400 font-medium">
            Hiển thị <span className="text-slate-700 font-bold">{paginatedPosts.length}</span> trên <span className="text-slate-700 font-bold">{totalItems}</span> bài đăng
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
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-9 h-9 rounded-xl text-[13px] font-black transition-all",
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-400 hover:bg-white"
                    )}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2)
                return <span key={page} className="text-slate-300">...</span>;
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
const StatCard = ({ label, value, color, icon: Icon, isAlert }: any) => (
  <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border-2 border-white flex flex-col justify-between h-32">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          color === "red" ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"
      )}>
        <Icon size={20} />
      </div>
    </div>
    <h3 className={cn("text-2xl font-black", color === "red" ? "text-red-500" : "text-slate-800")}>
      {value}
    </h3>
    <p className={cn("text-[10px] font-bold", color === "red" ? "text-red-400" : "text-blue-500")}>
      {isAlert ? "Cần xử lý ngay" : "+12 bài mới tháng này"}
    </p>
  </div>
);

export default CommunityPostManagement;