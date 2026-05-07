import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Flag,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hook";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "@/utils/FormatTime";
import { CustomSelect } from "@/components/common/CustomSelect";

// --- Types ---
interface CommunityReport {
  id: number;
  communityPostId: number;
  postOwnerUserId: number;
  reporterUserId: number;
  reason: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}
const REPORT_REASON_MAP: Record<string, string> = {
  spam: "Spam / Nội dung rác",
  harassment: "Quấy rối / Đả kích",
  hate_speech: "Ngôn từ thù ghét",
  inappropriate: "Nội dung không phù hợp",
  other: "Lý do khác",
};
const POST_STATUS_MAP: Record<number, { label: string; class: string }> = {
  0: { label: "Chờ duyệt", class: "bg-amber-50 text-amber-600" },
  1: { label: "Công khai", class: "bg-emerald-50 text-emerald-600" },
  2: { label: "Bị ẩn", class: "bg-red-50 text-red-600" },
};
const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Chờ duyệt", value: "0" },
  { label: "Công khai", value: "1" },
  { label: "Bị ẩn", value: "2" },
];
const CommunityPostManagement = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // --- States ---
  const [activeTab, setActiveTab] = useState("Bài đăng cộng đồng");
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsCount, setPostsCount] = useState(0);
  const [todayPostsCount, setTodayPostsCount] = useState(0);
  const [todayReportsCount, setTodayReportsCount] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // Paging state (Cursor-based cho Posts, Offset-based cho Reports)
  const [currentPage, setCurrentPage] = useState(1);
  const [_cursors, setCursors] = useState<{ [key: number]: any }>({ 1: null });
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const pageSize = 5;
  // Hàm tiện ích kiểm tra ngày hôm nay (so sánh YYYY-MM-DD)
  const isToday = (dateString: string) => {
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
      setCurrentPage(1); // Reset về trang 1 khi search
      setCursors({ 1: null }); // Xóa bộ nhớ cursors cũ
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- API Handlers ---
  // fetch count tất cả bài đăng
  // 1. Fetch và đếm Bài đăng
  const fetchAllPostsCount = async () => {
    try {
      const response = await fetch(
        "https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/community/posts?pageSize=100",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];

        // Tổng số bài đăng
        setPostsCount(items.length);

        // Đếm số bài đăng có createdAt là hôm nay
        const todayCount = items.filter((item: any) =>
          isToday(item.createdAt),
        ).length;
        setTodayPostsCount(todayCount);
      }
    } catch (error) {
      console.error("Lỗi đếm tổng bài đăng:", error);
    }
  };

  // 2. Fetch và đếm Báo cáo
  const fetchAllReportCount = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/community/admin/reports`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (response.ok) {
        const data = await response.json(); // Giả định API trả về mảng []
        const reportList = data || [];

        // 1. Cập nhật danh sách reports vào state
        setReports(reportList);

        // 2. Chỉ đếm những report có trạng thái "Pending" và tạo trong ngày "Hôm nay"
        const todayPendingCount = reportList.filter(
          (item: any) => item.status === "Pending" && isToday(item.createdAt),
        ).length;

        // Cập nhật vào state hiển thị ở subText của StatCard
        setTodayReportsCount(todayPendingCount);
      }
    } catch (error) {
      console.error("Lỗi fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch bài đăng (Cursor-based)
  // --- API Handlers ---
  const fetchPosts = async (page: number, _search: string) => {
    setLoading(true);
    try {
      const url = new URL(
        "https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/community/admin/posts",
      );

      url.searchParams.append("PageNumber", page.toString());
      url.searchParams.append("PageSize", pageSize.toString());

      // Thêm logic lọc theo status tại đây
      if (statusFilter !== "all") {
        url.searchParams.append("Status", statusFilter);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.items || []);
        setHasMorePosts(data.hasMore);
      }
    } catch (error) {
      console.error("Lỗi fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch báo cáo (Admin API)
  const fetchReports = async (page: number, statusFilter?: string) => {
    setLoading(true);
    try {
      const url = new URL(
        "https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/community/admin/reports",
      );

      // Thêm các tham số filter vào URL
      url.searchParams.append("PageNumber", page.toString());
      url.searchParams.append("PageSize", pageSize.toString()); // pageSize thường là 5 hoặc 10

      // Nếu có lọc theo status (ví dụ: 'Pending')
      if (statusFilter) {
        url.searchParams.append("Status", statusFilter);
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();

        // Lưu ý: Nếu API trả về object có dạng { items: [], totalCount: ... }
        // thì dùng data.items. Nếu trả về mảng trực tiếp thì dùng data.
        const reportItems = data.items || data;
        setReports(reportItems);

        // Tính toán thống kê hôm nay từ dữ liệu trả về (nếu cần)
        const todayCount = reportItems.filter((item: any) =>
          isToday(item.createdAt),
        ).length;
        setTodayReportsCount(todayCount);

        // Nếu API có trả về tổng số lượng bản ghi để phân trang
        if (data.totalCount) setReports(data.totalCount);
      }
    } catch (error) {
      console.error("Lỗi fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };
  // --- API Handlers ---

  const handleApprovePost = async (postId: number) => {
    if (!window.confirm("Xác nhận phê duyệt bài viết này công khai?")) return;

    try {
      const response = await fetch(
        `https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/community/admin/posts/${postId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ approverNotes: "Bài viết hợp lệ" }), // Request body theo Swagger
        },
      );

      if (response.ok) {
        // Refresh lại danh sách sau khi thực hiện thành công
        fetchPosts(currentPage, debouncedSearch);
      }
    } catch (error) {
      console.error("Lỗi duyệt bài:", error);
    }
  };

  const handleRejectPost = async (postId: number) => {
    const reason = window.prompt("Nhập lý do từ chối bài viết:");
    if (reason === null) return; // Người dùng nhấn Cancel

    try {
      const response = await fetch(
        `https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/community/admin/posts/${postId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ reason: reason || "Nội dung không phù hợp" }), // Request body theo Swagger
        },
      );

      if (response.ok) {
        fetchPosts(currentPage, debouncedSearch);
      }
    } catch (error) {
      console.error("Lỗi từ chối bài:", error);
    }
  };
  // Duyệt/Bác bỏ báo cáo
  const handleReviewReport = async (
    reportId: number,
    action: "approve_violation" | "reject",
  ) => {
    const confirmMsg =
      action === "approve_violation"
        ? "Xác nhận bài viết này vi phạm và sẽ bị ẩn khỏi feed?"
        : "Xác nhận bác bỏ tố cáo này?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(
        `https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/community/admin/reports/${reportId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            action,
            reviewNote:
              action === "approve_violation"
                ? "Vi phạm tiêu chuẩn cộng đồng"
                : "Tố cáo không hợp lệ",
          }),
        },
      );

      if (response.ok) {
        // Refresh lại dữ liệu cả 2 nguồn để cập nhật Stats và List
        fetchPosts(currentPage, debouncedSearch);
        fetchReports(currentPage);
      }
    } catch (error) {
      console.error("Review error:", error);
    }
  };

  // --- Effects ---

  // Khởi chạy lần đầu: Lấy reports để có số lượng Stats
  useEffect(() => {
    fetchAllReportCount();
    fetchAllPostsCount(); // Lấy tổng số bài đăng để hiển thị ở StatCard
  }, []);

  // Sửa đổi useEffect gọi api bài đăng
  useEffect(() => {
    if (activeTab === "Bài đăng cộng đồng") {
      fetchPosts(currentPage, debouncedSearch);
    }
  }, [currentPage, debouncedSearch, activeTab, statusFilter]); // Thêm statusFilter vào dependency array

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reports.slice(start, start + pageSize);
  }, [reports, currentPage]);

  const totalPages = useMemo(() => {
    if (activeTab === "Bài đăng cộng đồng") {
      // Nếu API không trả về totalCount, chúng ta chỉ có thể hiển thị trang hiện tại
      // và cho phép nhấn Next nếu hasMore = true.
      // Giả lập: Nếu đang ở trang hiện tại và có hasMore, ít nhất có thêm 1 trang nữa.
      return hasMorePosts ? currentPage + 1 : currentPage;
    }
    return Math.ceil(reports.length / pageSize) || 1;
  }, [activeTab, hasMorePosts, currentPage, reports.length]);
  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCurrentPage(1);
    setCursors({ 1: null });
  };
  return (
    <div className="flex-1 min-h-screen bg-[#f7eccd] p-4 animate-in fade-in duration-500">
      {/* 1. Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <StatCard
          label="Tổng bài đăng cộng đồng"
          value={postsCount}
          color="blue"
          icon={Flag}
          subText={`+${todayPostsCount} bài đăng hôm nay`} // Text nhỏ bên dưới
        />
        <StatCard
          label="Đang chờ duyệt"
          value={todayReportsCount}
          color="amber"
          icon={AlertCircle}
          subText={`+${todayReportsCount} tố cáo hôm nay`} // Hoặc bất kỳ nội dung nào bạn muốn
        />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[1.5rem] overflow-hidden">
        {/* Header Table: Tabs & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-50 px-8 py-2 gap-4">
          <div className="flex">
            {["Bài đăng cộng đồng", "Bị tố cáo"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
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

          <div className="flex flex-col md:flex-row items-center gap-4">
            {activeTab === "Bài đăng cộng đồng" && (
              <>
                {/* Dropdown Filter Status */}
                <CustomSelect
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1); // Reset về trang 1 khi lọc
                  }}
                  className="w-full md:w-44"
                />

                {/* Thanh Search */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm nội dung bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Table Area */}
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                {activeTab === "Bài đăng cộng đồng" ? (
                  <>
                    {[
                      "Tác giả",
                      "Nội dung",
                      "Ngày tạo",
                      "Trạng thái",
                      "Hành động",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      "ID Post",
                      "Lý do",
                      "Mô tả",
                      "Ngày báo",
                      "Trạng thái",
                      "Hành động",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                /* 1. Trạng thái Loading */
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : activeTab === "Bài đăng cộng đồng" ? (
                /* 2. Tab Bài đăng: Kiểm tra có data hay không */
                posts.length > 0 ? (
                  posts.map((post) => {
                    const statusInfo = POST_STATUS_MAP[post.status] || {
                      label: "N/A",
                      class: "bg-slate-50 text-slate-400",
                    };

                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.author.avatar}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                              alt={post.author.name}
                            />
                            <div className="flex flex-col text-left">
                              <span className="text-[14px] font-bold text-slate-700">
                                {post.author.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">
                                {post.author.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[13px] text-slate-500 max-w-md">
                          <div className="flex flex-col gap-1">
                            <p className="line-clamp-2">{post.description}</p>
                            {/* Hiển thị lý do ẩn nếu có (dùng cho status 2) */}
                            {post.status === 2 && post.reviewReason && (
                              <span className="text-[10px] text-red-400 italic font-medium">
                                Lý do: {post.reviewReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                          {formatTimeAgo(post.createdAt)}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                statusInfo.class,
                              )}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {/* Nút Xem chi tiết luôn hiển thị */}
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/community-posts/${post.id}`,
                                )
                              }
                              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>

                            {/* Chỉ hiển thị Approve/Reject nếu bài đăng đang Chờ duyệt (status 0) */}
                            {post.status === 0 && (
                              <>
                                <button
                                  onClick={() => handleApprovePost(post.id)}
                                  className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                  title="Phê duyệt"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleRejectPost(post.id)}
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
                  /* UI Empty State cho Bài đăng */
                  <EmptyState
                    searchTerm={searchTerm}
                    handleClearSearch={handleClearSearch}
                  />
                )
              ) : /* 3. Tab Bị tố cáo: Kiểm tra có data hay không */
              paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5 text-[13px] font-bold text-blue-600">
                      #{report.communityPostId}
                    </td>
                    <td className="px-8 py-5 text-[11px] font-black uppercase">
                      <span className="bg-red-50 text-red-500 px-2 py-1 rounded-md">
                        {/* Nếu không tìm thấy key trong map, hiển thị giá trị gốc */}
                        {REPORT_REASON_MAP[report.reason] || report.reason}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[13px] text-slate-500 max-w-[200px] truncate">
                      {report.description}
                    </td>
                    <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                      {formatTimeAgo(report.createdAt)}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          report.status === "Pending" &&
                            "bg-amber-50 text-amber-500",
                          report.status === "Approved" &&
                            "bg-emerald-50 text-emerald-500",
                          report.status === "Rejected" &&
                            "bg-slate-100 text-slate-400",
                        )}
                      >
                        {report.status === "Pending"
                          ? "Chờ duyệt"
                          : report.status === "Approved"
                            ? "Vi phạm"
                            : "Bác bỏ"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center gap-2">
                        {report.status === "Pending" ? (
                          <>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/community-posts/${report.communityPostId}`,
                                )
                              }
                              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                              onClick={() =>
                                handleReviewReport(
                                  report.id,
                                  "approve_violation",
                                )
                              }
                              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                            <button
                              onClick={() =>
                                handleReviewReport(report.id, "reject")
                              }
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/community-posts/${report.communityPostId}`,
                              )
                            }
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* UI Empty State cho Báo cáo */
                <EmptyState
                  searchTerm={searchTerm}
                  handleClearSearch={handleClearSearch}
                />
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Numeric Pagination UI */}
        <div className="px-6 py-5 bg-slate-50/20 flex flex-col md:flex-row justify-between items-center border-t border-slate-50 gap-4">
          <p className="text-[12px] text-slate-400 font-medium">
            Hiển thị trang{" "}
            <span className="text-slate-700 font-bold">{currentPage}</span> trên{" "}
            {totalPages}
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
                    : "text-slate-400 hover:bg-white hover:text-slate-600",
                )}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={
                (activeTab === "Bài đăng cộng đồng"
                  ? !hasMorePosts
                  : currentPage === totalPages) || loading
              }
              onClick={() => setCurrentPage((p) => p + 1)}
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

const StatCard = ({ label, value, color, icon: Icon, subText }: any) => (
  <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border-2 border-white flex flex-col justify-between h-32 transition-all hover:scale-[1.02]">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          color === "amber"
            ? "bg-amber-50 text-amber-500"
            : "bg-blue-50 text-blue-500",
        )}
      >
        <Icon size={20} />
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
        {value}
      </h3>
      {/* Hiển thị text nhỏ ở dưới */}
      {subText && (
        <p
          className={cn(
            "text-[10px] font-bold mt-1",
            color === "amber" ? "text-amber-500/80" : "text-blue-500/80",
          )}
        >
          {subText}
        </p>
      )}
    </div>
  </div>
);
const EmptyState = ({
  searchTerm,
  handleClearSearch,
}: {
  searchTerm: string;
  handleClearSearch: () => void;
}) => (
  <tr>
    <td colSpan={6} className="py-24">
      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Search size={32} className="text-slate-300" />
        </div>
        <h3 className="text-[16px] font-black text-slate-700">
          Không tìm thấy kết quả
        </h3>
        <p className="text-[13px] text-slate-400 mt-1 max-w-[280px] text-center leading-relaxed">
          {searchTerm ? (
            <>
              Chúng tôi không tìm thấy nội dung nào khớp với từ khóa{" "}
              <span className="font-bold text-slate-600">"{searchTerm}"</span>.
            </>
          ) : (
            "Hiện chưa có dữ liệu hiển thị trong danh sách này."
          )}
        </p>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="mt-6 px-6 py-2.5 bg-blue-600 text-white text-[12px] font-black uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg cursor-pointer"
          >
            Xóa tìm kiếm
          </button>
        )}
      </div>
    </td>
  </tr>
);
export default CommunityPostManagement;
