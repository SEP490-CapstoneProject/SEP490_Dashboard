import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  Users as UsersIcon,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { allUsers } from "@/data/allUser";

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  status: "Hoạt động" | "Bị khóa";
  joinedDate: string;
  avatarSeed: string;
}

interface PaginationResponse {
  data: User[];
  totalItems: number;
  totalPages: number;
}

// --- Mock Data Generator ---
const fetchUsersFromBackend = async (
  pageNum: number,
  pageSize: number,
): Promise<PaginationResponse> => {
  // Giả lập delay mạng
  await new Promise((resolve) => setTimeout(resolve, 500));


  const start = (pageNum - 1) * pageSize;
  const data = allUsers.slice(start, start + pageSize);

  return {
    data,
    totalItems: allUsers.length,
    totalPages: Math.ceil(allUsers.length / pageSize),
  };
};

const UserManagement = () => {
  // --- States ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5; // Bạn có thể thay đổi kích thước trang ở đây

  const navigate = useNavigate();
  // --- Fetch Logic ---
  const loadData = async () => {
    setLoading(true);
    const response = await fetchUsersFromBackend(currentPage, pageSize);
    setUsers(response.data);
    setTotalItems(response.totalItems);
    setTotalPages(response.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentPage]); // Re-fetch khi pageNum thay đổi

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafd] p-8 animate-in fade-in duration-500">
      {/* 1. Header & Action Button */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Danh sách Người dùng
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Theo dõi, phê duyệt và quản lý thông tin người dùng
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer">
          <UserPlus size={18} /> Thêm người dùng
        </button>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Tổng số người dùng"
          value="1,280"
          trend="+12% so với tháng trước"
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          label="Người dùng mới"
          value="145"
          trend="Trong 30 ngày qua"
          icon={UserCheck}
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
            placeholder="Tìm kiếm theo tên, email hoặc ID..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <div className="flex gap-2 ">
          <FilterSelect label="Tất cả trạng thái" />
          <FilterSelect label="Sắp xếp: Mới nhất" />
          <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <Filter size={20} />
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
                "NGƯỜI DÙNG",
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
                <td
                  colSpan={6}
                  className="text-center py-20 text-slate-400 font-medium"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 text-[13px] font-bold text-slate-400">
                    {user.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100 uppercase">
                        {user.name.split(" ").pop()?.substring(0, 2)}
                      </div>
                      <span className="text-[14px] font-bold text-slate-700">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter",
                        user.status === "Hoạt động"
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-red-50 text-red-500",
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-bold text-slate-400">
                    {user.joinedDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                        <Eye
                          size={18}
                          onClick={() =>
                            navigate(`/dashboard/users/${user.id}`)
                          }
                        />
                      </button>
                      <button
                        className={cn(
                          "p-2 rounded-lg transition-all cursor-pointer",
                          user.status === "Bị khóa"
                            ? "text-red-500 bg-red-50"
                            : "text-slate-400 hover:text-red-500 hover:bg-red-50",
                        )}
                      >
                        <Ban size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 5. Pagination (Logic Backend-driven) */}
        <div className="px-8 py-6 bg-slate-50/30 flex justify-between items-center border-t border-slate-50">
          <p className="text-[13px] text-slate-400 font-medium">
            Hiển thị{" "}
            <span className="text-slate-700 font-bold">
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            của <span className="text-slate-700 font-bold">{totalItems}</span>{" "}
            người dùng
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Logic hiển thị số trang cơ bản */}
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
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
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
              className="p-2 text-slate-400 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
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

const FilterSelect = ({ label }: { label: string }) => (
  <button className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[13px] font-bold flex items-center gap-4 transition-all border border-transparent focus:border-blue-200">
    {label} <MoreHorizontal size={14} className="rotate-90" />
  </button>
);

export default UserManagement;
