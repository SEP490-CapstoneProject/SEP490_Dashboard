import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  Building2,
  Briefcase,
  ShieldAlert,
  MapPin,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Recruiter } from "@/types/user";
import { handleEnumStatus } from "@/utils/FormatTime";
import { CustomSelect } from "@/components/common/CustomSelect";
import { CreateUserModal } from "../user/CreateUserModal";
import { useAppSelector } from "@/store/hook";
import { notify } from "@/lib/toast";

// Định nghĩa options cho Select
const statusOptions = [
  { label: "Tất cả trạng thái", value: "All" },
  { label: "Đang hoạt động", value: "Active" },
  { label: "Đang chờ duyệt", value: "Pending" },
  { label: "Đã khóa", value: "Locked" },
];

const activityOptions = [
  { label: "Tất cả lĩnh vực", value: "All" },
  { label: "Công nghệ thông tin", value: "IT" },
  { label: "Tài chính", value: "Finance" },
  { label: "Marketing", value: "Marketing" },
];

const RecruiterManagement = () => {
  const navigate = useNavigate();

  // --- States Dữ liệu ---
  const [allRecruiters, setAllRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { accessToken } = useAppSelector((state) => state.auth);
  // --- States Filters ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activityFilter, setActivityFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Fetch Data ---
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://userprofile-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/Company",
      );
      const data = await response.json();
      console.log("company", data);
      setAllRecruiters(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu nhà tuyển dụng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- LOGIC XỬ LÝ DỮ LIỆU (Search, Filter, Sort) ---
  const filteredRecruiters = useMemo(() => {
    let result = [...allRecruiters];

    // 1. Search theo tên công ty hoặc email
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.companyName?.toLowerCase().includes(lowerSearch) ||
          r.email?.toLowerCase().includes(lowerSearch),
      );
    }

    // 2. Lọc theo trạng thái
    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // 3. Lọc theo lĩnh vực
    if (activityFilter !== "All") {
      result = result.filter((r) => r.activityField === activityFilter);
    }

    // 4. Sort mặc định (Ví dụ: Pending lên đầu để duyệt)
    result.sort((a, b) => {
      if (a.status === "Active" && b.status !== "Active") return -1;
      return 0;
    });

    return result;
  }, [allRecruiters, searchTerm, statusFilter, activityFilter]);

  // --- Logic Phân trang khớp với dữ liệu search ---
  const totalItems = filteredRecruiters.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const recruitersToDisplay = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecruiters.slice(start, start + pageSize);
  }, [filteredRecruiters, currentPage]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activityFilter]);
  const handleLockUser = async (userId: number) => {
    try {
      const response = await fetch(
        `https://auth-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/Auth/lock-user/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (response.ok) {
        notify.success("Khóa người dùng thành công");
        loadData();
      } else {
        notify.error("Lỗi khi khóa người dùng");
      }
    } catch (error) {}
  };
  const handleUnLockUser = async (userId: number) => {
    try {
      const response = await fetch(
        `https://auth-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/Auth/unlock-user/${userId}`,
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
      {/* 1. Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <StatCard
          label="Tài khoản chờ duyệt"
          value={allRecruiters.filter((r) => r.status === "Active").length}
          trend="Cần xử lý ngay"
          icon={ShieldAlert}
          color="orange"
        />
        <StatCard
          label="Tổng nhà tuyển dụng"
          value={allRecruiters.length}
          trend="+12.5% tháng này"
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Kết quả tìm kiếm"
          value={totalItems}
          trend="Theo bộ lọc hiện tại"
          icon={Briefcase}
          color="orange"
        />
      </div>

      {/* 2. Action Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-[1.2rem] font-black text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Plus size={18} /> Thêm nhà tuyển dụng
        </button>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white border-2 border-white shadow-sm rounded-3xl p-2 flex flex-col md:flex-row gap-2 items-center mb-2">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm theo tên công ty hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <CustomSelect
            options={activityOptions}
            value={activityFilter}
            onChange={setActivityFilter}
          />
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
              setActivityFilter("All");
            }}
            className="px-4 py-3 text-red-500 text-[12px] font-black hover:bg-red-50 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      {/* 4. Table Area */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[1rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-50">
              <tr>
                {[
                  "ID",
                  "Nhà tuyển dụng",
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
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin" />
                      <span className="text-xs font-bold uppercase">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : recruitersToDisplay.length > 0 ? (
                recruitersToDisplay.map((recruiter) => (
                  <tr
                    key={recruiter.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-400">
                      #{recruiter.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            recruiter.avatar ||
                            `https://ui-avatars.com/api/?name=${recruiter.companyName}`
                          }
                          className="w-9 h-9 rounded-2xl object-cover bg-slate-100 border border-slate-50"
                          alt="logo"
                        />
                        <div>
                          <p className="text-[14px] font-black text-slate-700 leading-tight">
                            {recruiter.companyName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-1 uppercase tracking-tighter">
                            <MapPin size={10} />{" "}
                            {recruiter.address || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                      {recruiter.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                        {recruiter.activityField || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={recruiter.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/recruiters/${recruiter.id}`)
                          }
                          className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        {/* {recruiter.status === "Active" && (
                          <button className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer">
                            <CheckCircle2 size={18} />
                          </button>
                        )} */}
                        {recruiter.status === "Locked" && (
                          <button className="p-2.5 text-red-400 bg-red-50 rounded-xl transition-all cursor-pointer" 
                            onClick={() => handleUnLockUser(recruiter.userId)}
                          >
                            <Ban size={18} />
                          </button>
                        )}
                        {recruiter.status === "Active" && (
                          <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            onClick={() => handleLockUser(recruiter.userId)}
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
                  <td
                    colSpan={6}
                    className="text-center py-20 text-slate-400 font-bold"
                  >
                    Không tìm thấy nhà tuyển dụng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Area */}
        <div className="px-4 py-1 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-2 border-t border-slate-50">
          <p className="text-[13px] text-slate-400 font-medium">
            Hiển thị{" "}
            <span className="text-slate-700 font-bold">
              {recruitersToDisplay.length}
            </span>{" "}
            trên <span className="text-slate-700 font-bold">{totalItems}</span>{" "}
            nhà tuyển dụng
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-xl disabled:opacity-20 cursor-pointer shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-[13px] font-black transition-all",
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-slate-400 hover:bg-white",
                    )}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-xl disabled:opacity-20 cursor-pointer shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        role={2}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

// --- Sub-components Helper ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    Active: "bg-emerald-50 text-emerald-500",
    Pending: "bg-orange-50 text-orange-500",
    Locked: "bg-slate-100 text-slate-500",
  };
  const dotStyles: any = {
    Active: "bg-emerald-500",
    Pending: "bg-orange-500",
    Locked: "bg-slate-400",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-[11px] font-black uppercase tracking-tighter",
        styles[status] || "bg-red-50 text-red-500",
      )}
    >
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          dotStyles[status] || "bg-red-500",
        )}
      />
      {handleEnumStatus(status)}
    </div>
  );
};

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white border-2 border-white p-5 rounded-[2rem] shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">
        {value}
      </h3>
      <p
        className={cn(
          "text-[10px] font-bold mt-1",
          color === "blue" ? "text-emerald-500" : "text-orange-500",
        )}
      >
        {trend}
      </p>
    </div>
    <div
      className={cn(
        "w-12 h-12 rounded-3xl flex items-center justify-center shadow-inner",
        color === "blue"
          ? "bg-blue-50 text-blue-600"
          : "bg-orange-50 text-orange-500",
      )}
    >
      <Icon size={32} />
    </div>
  </div>
);

export default RecruiterManagement;
