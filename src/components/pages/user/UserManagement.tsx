import { useState, useEffect, useMemo } from "react";
import {
  Search,
  UserPlus,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users as UsersIcon,
  UserCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Employee } from "@/types/user";
import { formatTimeAgo, handleEnumStatus } from "@/utils/FormatTime";
import { CustomSelect } from "@/components/common/CustomSelect";
import { CreateUserModal } from "./CreateUserModal";
import { notify } from "@/lib/toast";
import { useAppSelector } from "@/store/hook";

const statusOptions = [
  { label: "Tất cả trạng thái", value: "All" },
  { label: "Hoạt động", value: "Active" },
  { label: "Bị khóa", value: "Locked" },
];

const sortOptions = [
  { label: "Sắp xếp: Mới nhất", value: "newest" },
  { label: "Sắp xếp: Cũ nhất", value: "oldest" },
];

// Giả sử API trả về toàn bộ danh sách để client tự xử lý lọc/phân trang
const fetchAllUsers = async (): Promise<Employee[]> => {
  const response = await fetch(
    "https://userprofile-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/Employee",
  );
  return await response.json();
};

const UserManagement = () => {
  const navigate = useNavigate();

  // --- States ---
  const [allUsers, setAllUsers] = useState<Employee[]>([]); // Lưu trữ dữ liệu gốc
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { accessToken } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Load Data ---
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setAllUsers(data);
      console.log("✅ Dữ liệu người dùng đã tải:", data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- LOGIC XỬ LÝ DỮ LIỆU (QUAN TRỌNG) ---

  // 1. Filter và Sort dữ liệu gốc
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...allUsers];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(lowerSearch) ||
          u.email?.toLowerCase().includes(lowerSearch) ||
          u.id?.toString().includes(lowerSearch),
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((u) => u.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createAt).getTime();
      const dateB = new Date(b.createAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allUsers, searchTerm, statusFilter, sortOrder]);

  // 2. Tính toán các thông số phân trang dựa trên mảng ĐÃ FILTER
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // 3. Cắt mảng để hiển thị đúng trang hiện tại
  const usersToDisplay = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  // Đưa về trang 1 nếu kết quả filter làm giảm số lượng trang
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  const handleLockUser = async (userId: number) => {
    try {
      const response = await fetch(
        `https://auth-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/Auth/lock-user/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (response.ok) {
        notify.success("Khóa người dùng thành công");
        loadData();
      } else {
        notify.error("Không thể khóa người dùng");
      }
    } catch (error) {}
  };
  const handleUnLockUser = async (userId: number) => {
    try {
      const response = await fetch(
        `https://auth-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/Auth/unlock-user/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (response.ok) {
        notify.success("Mở khóa người dùng thành công");
        loadData();
      } else {
        notify.error("Lỗi khi mở khóa người dùng");
      }
    } catch (error) {}
  };
  return (
    <div className="flex-1 min-h-screen bg-[#f7eccd] p-2 animate-in fade-in duration-500">
      {/* 1. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Tổng số người dùng"
          value={allUsers.length.toLocaleString()}
          trend="+12% so với tháng trước"
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          label="Kết quả lọc"
          value={totalItems.toLocaleString()}
          trend="Theo điều kiện hiện tại"
          icon={UserCheck}
          color="orange"
        />
      </div>

      {/* 2. Button Action */}
      <div className="flex justify-end mb-2">
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm  cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <UserPlus size={18} /> Thêm người dùng
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border-2 border-white shadow-sm rounded-3xl p-3 flex flex-col lg:flex-row gap-2 items-center mb-2">
        <div className="relative flex-1 w-full group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <CustomSelect
            options={sortOptions}
            value={sortOrder}
            onChange={setSortOrder}
          />
          {/* <button onClick={loadData} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <Filter size={20} />
          </button> */}
        </div>
      </div>

      {/* 4. Table Area */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[1rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-50">
              <tr>
                {[
                  "ID",
                  "Ứng viên",
                  "EMAIL",
                  "TRẠNG THÁI",
                  "NGÀY THAM GIA",
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
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin" />
                      <span className="text-xs font-bold uppercase">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : usersToDisplay.length > 0 ? (
                usersToDisplay.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-400">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${user.name}`
                          }
                          alt="Avatar"
                          className="w-9 h-9 rounded-full object-cover border border-slate-100"
                        />
                        <span className="text-[14px] font-bold text-slate-700">
                          {user.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                          user.status === "Active"
                            ? "bg-emerald-50 text-emerald-500"
                            : "bg-red-50 text-red-500",
                        )}
                      >
                        {handleEnumStatus(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-400">
                      {formatTimeAgo(user.createAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/users/${user.id}`)
                          }
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        {user.status === "Locked" && (
                          <button
                            className="p-2.5 text-red-400 bg-red-50 rounded-xl transition-all cursor-pointer"
                            onClick={() => handleUnLockUser(user.userId)}
                          >
                            <Ban size={18} />
                          </button>
                        )}
                        {user.status === "Active" && (
                          <button
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            onClick={() => handleLockUser(user.userId)}
                          >
                            <Ban size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400">
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        <div className="px-4 py-1 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-50">
          <p className="text-[13px] text-slate-400 font-medium">
            Hiển thị{" "}
            <span className="text-slate-700 font-bold">
              {usersToDisplay.length}
            </span>{" "}
            trên <span className="text-slate-700 font-bold">{totalItems}</span>{" "}
            kết quả phù hợp
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              // Rút gọn logic hiển thị trang (hiển thị trang đầu, trang cuối và xung quanh trang hiện tại)
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
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-slate-400 hover:bg-white",
                    )}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2)
                return (
                  <span key={page} className="text-slate-300">
                    ...
                  </span>
                );
              return null;
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        role={1}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

// --- StatCard Component ---
const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white border-2 border-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
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
        "w-14 h-14 rounded-3xl flex items-center justify-center shadow-inner",
        color === "blue"
          ? "bg-blue-50 text-blue-500"
          : "bg-orange-50 text-orange-500",
      )}
    >
      <Icon size={28} />
    </div>
  </div>
);

export default UserManagement;
