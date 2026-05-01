import { useState, useEffect } from "react";
import { type LucideIcon } from "lucide-react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { portfolioAPI } from "@/services/portfolio.api";
import { useAppSelector } from "@/store/hook";
import { Criteria } from "@/types/criteria";

const CriteriaPage = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCriteria, setSelectedCriteria] = useState<Criteria | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const pageSize = 5;

  // Tạo màu động dựa trên kind (không hardcode)
  const getKindColor = (kind: string): string => {
    const colors = [
      "bg-blue-50 text-blue-600",
      "bg-purple-50 text-purple-600",
      "bg-emerald-50 text-emerald-600",
      "bg-orange-50 text-orange-600",
      "bg-pink-50 text-pink-600",
      "bg-red-50 text-red-600",
      "bg-indigo-50 text-indigo-600",
      "bg-cyan-50 text-cyan-600",
    ];
    // Hash kind string để chọn màu (đảm bảo cùng kind = cùng màu)
    let hash = 0;
    for (let i = 0; i < kind.length; i++) {
      hash = ((hash << 5) - hash) + kind.charCodeAt(i);
      hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Handle viewing criteria details
  const handleViewCriteria = (item: Criteria) => {
    setSelectedCriteria(item);
    setShowDeleteConfirm(false);
  };

  // Handle deleting criteria
  const handleDeleteCriteria = async () => {
    if (!selectedCriteria || !accessToken) return;

    setDeleteLoading(true);
    try {
      await portfolioAPI.deleteCriteria(selectedCriteria.id, accessToken || undefined);
      // Remove from list
      setCriteria(criteria.filter((c) => c.id !== selectedCriteria.id));
      setSelectedCriteria(null);
      setShowDeleteConfirm(false);
      console.log("✅ Criterion deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting criterion:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setSelectedCriteria(null);
    setShowDeleteConfirm(false);
  };

  // Load criteria
  useEffect(() => {
    const loadCriteria = async () => {
      setLoading(true);
      try {
        const data = await portfolioAPI.getCriteria(accessToken || undefined);
        setCriteria(data);
      } catch (error) {
        console.error("Error loading criteria:", error);
        setCriteria([]);
      } finally {
        setLoading(false);
      }
    };
    loadCriteria();
  }, [accessToken]);

  // Filter criteria based on active status
  const filteredCriteria = activeTab === "Tất cả" 
    ? criteria 
    : activeTab === "Hoạt động"
      ? criteria.filter((c) => c.isActive)
      : criteria.filter((c) => !c.isActive);

  const totalItems = filteredCriteria.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedCriteria = filteredCriteria.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeCriteria = criteria.filter((c) => c.isActive).length;
  const inactiveCriteria = criteria.filter((c) => !c.isActive).length;

  return (
    <div className="flex-1 min-h-screen bg-[#f7eccd] p-4 animate-in fade-in duration-500">
      {/* 1. Header Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Tổng tiêu chí"
          value={criteria.length.toString()}
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          label="Tiêu chí hoạt động"
          value={activeCriteria.toString()}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Tiêu chí bị tắt"
          value={inactiveCriteria.toString()}
          icon={XCircle}
          color="red"
        />
        <StatCard
          label="Kiểu tiêu chí"
          value={new Set(criteria.map((c) => c.kind)).size.toString()}
          icon={Filter}
          color="orange"
        />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[2rem] overflow-hidden">
        {/* Title & Filter Header */}
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Danh sách tiêu chí đánh giá
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-50 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={16} /> Lọc dữ liệu
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-50 px-8 mt-4">
          {["Tất cả", "Hoạt động", "Bị tắt"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={cn(
                "py-5 px-6 text-[13px] font-bold transition-all relative",
                activeTab === tab
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
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
                {["ID", "TÊN TIÊU CHÍ", "LOẠI", "TRẠNG THÁI", "HÀNH ĐỘNG"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-slate-400 font-bold italic text-xs uppercase"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin" />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : paginatedCriteria.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    Không tìm thấy tiêu chí nào.
                  </td>
                </tr>
              ) : (
                paginatedCriteria.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">
                      #{item.id}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-700">
                      {item.name}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tighter",
                          getKindColor(item.kind)
                        )}
                      >
                        {item.kind}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                          item.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        )}
                      >
                        {item.isActive ? "Hoạt động" : "Bị tắt"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleViewCriteria(item)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-slate-50/20 flex justify-between items-center border-t border-slate-50">
          <p className="text-[12px] text-slate-400 font-medium">
            Hiển thị{" "}
            <span className="text-slate-700 font-bold">
              {paginatedCriteria.length > 0
                ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
                    currentPage * pageSize,
                    totalItems
                  )}`
                : "0"}
            </span>{" "}
            trong tổng số{" "}
            <span className="text-slate-700 font-bold">{totalItems}</span> tiêu chí
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-300 disabled:opacity-30 hover:bg-white rounded-lg transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[12px] font-black transition-all",
                  currentPage === i + 1
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:bg-white",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-300 disabled:opacity-30 hover:bg-white rounded-lg transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Criteria Detail Modal */}
      {selectedCriteria && (
        <CriteriaDetailModal
          criteria={selectedCriteria}
          onClose={handleCloseModal}
          onDelete={() => setShowDeleteConfirm(true)}
          deleteLoading={deleteLoading}
          showDeleteConfirm={showDeleteConfirm}
          onConfirmDelete={handleDeleteCriteria}
          onCancelDelete={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

// --- Helper Stat Card ---
interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: StatCardProps) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-white flex flex-col justify-between h-44">
    <div className="flex justify-between items-start">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          color === "blue"
            ? "bg-blue-50 text-blue-500"
            : color === "emerald"
              ? "bg-emerald-50 text-emerald-500"
              : color === "red"
                ? "bg-red-50 text-red-500"
                : "bg-orange-50 text-orange-500"
        )}
      >
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

// --- Criteria Detail Modal ---
interface CriteriaDetailModalProps {
  criteria: Criteria;
  onClose: () => void;
  onDelete: () => void;
  deleteLoading: boolean;
  showDeleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

const CriteriaDetailModal = ({
  criteria,
  onClose,
  onDelete,
  deleteLoading,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: CriteriaDetailModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white rounded-t-2xl">
          <h2 className="text-xl font-black text-slate-800">Chi tiết tiêu chí</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
              ID
            </p>
            <p className="text-[14px] font-bold text-slate-700">#{criteria.id}</p>
          </div>

          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Tên tiêu chí
            </p>
            <p className="text-[14px] font-bold text-slate-700">{criteria.name}</p>
          </div>

          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Loại
            </p>
            <span className="inline-block px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tighter bg-blue-50 text-blue-600">
              {criteria.kind}
            </span>
          </div>

          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Trạng thái
            </p>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tighter",
                criteria.isActive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              )}
            >
              {criteria.isActive ? "Hoạt động" : "Bị tắt"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showDeleteConfirm ? (
          <div className="p-6 border-t border-slate-100 space-y-3 bg-red-50">
            <p className="text-[13px] font-bold text-red-700">
              Bạn có chắc muốn xóa tiêu chí này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancelDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={onConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border-t border-slate-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <X size={16} /> Đóng
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CriteriaPage;
