import { useState, useEffect } from "react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Contact2,
  Clock,
  AlertCircle,
  Flag,
  Filter,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { portfolioAPI } from "@/services/portfolio.api";
import { Portfolio as PortfolioType, PortfolioListResponse } from "@/types/portfolio";

// --- Local Interface for Display ---
interface PortfolioDisplay {
  id: string;
  portfolioId: number;
  portfolioName: string;
  userName: string;
  avatar: string;
  studyField: string;
  createdAt: string;
  status: string;
}

const PortfolioManagement = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [portfolios, setPortfolios] = useState<PortfolioDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 4;

  // Format date from ISO to DD/MM/YYYY
  const formatDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  // Handle viewing portfolio details
  const handleViewPortfolio = async (portfolioId: number) => {
    setDetailLoading(true);
    try {
      const portfolio = await portfolioAPI.getPortfolioById(portfolioId);
      setSelectedPortfolio(portfolio);
    } catch (error) {
      console.error("Error loading portfolio details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle approve/reject actions (placeholder)
  const handleApprove = () => {
    console.log("Approved portfolio:", selectedPortfolio?.portfolioId);
    setSelectedPortfolio(null);
  };

  const handleReject = () => {
    console.log("Rejected portfolio:", selectedPortfolio?.portfolioId);
    setSelectedPortfolio(null);
  };

  // Get study field from portfolio blocks
  const getStudyField = (portfolioData: PortfolioType): string => {
    const introBlock = portfolioData.blocks.find((b) => b.type === "INTRO");
    if (introBlock && introBlock.data && typeof introBlock.data === "object" && "studyField" in introBlock.data) {
      return (introBlock.data as any).studyField || "N/A";
    }
    return "N/A";
  };

  // Get user name from portfolio blocks
  const getUserName = (portfolioData: PortfolioType): string => {
    const introBlock = portfolioData.blocks.find((b) => b.type === "INTRO");
    if (introBlock && introBlock.data && typeof introBlock.data === "object" && "name" in introBlock.data) {
      return (introBlock.data as any).name || "Unknown";
    }
    return "Unknown";
  };

  // Get avatar from portfolio blocks
  const getAvatar = (portfolioData: PortfolioType): string => {
    const introBlock = portfolioData.blocks.find((b) => b.type === "INTRO");
    if (introBlock && introBlock.data && typeof introBlock.data === "object" && "avatar" in introBlock.data) {
      return (introBlock.data as any).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${portfolioData.portfolioId}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${portfolioData.portfolioId}`;
  };

  // Map API data to display format
  const mapToDisplay = (apiPortfolios: PortfolioType[]): PortfolioDisplay[] => {
    return apiPortfolios.map((pf) => ({
      id: `#PF-${String(pf.portfolioId).padStart(4, "0")}`,
      portfolioId: pf.portfolioId,
      portfolioName: pf.portfolioName,
      userName: getUserName(pf),
      avatar: getAvatar(pf),
      studyField: getStudyField(pf),
      createdAt: formatDate(pf.createdAt),
      status: pf.isMain ? "MAIN" : pf.isPublic ? "PUBLIC" : "PRIVATE",
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res: PortfolioListResponse = await portfolioAPI.getPortfolios(
          currentPage,
          pageSize,
        );
        const displayData = mapToDisplay(res.items);
        setPortfolios(displayData);
        setTotalItems(res.total);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error("Error loading portfolios:", error);
        setPortfolios([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f7eccd] p-4 animate-in fade-in duration-500">
      {/* 1. Header Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Tổng số hồ sơ"
          value={totalItems.toString()}
          
          icon={Contact2}
          color="blue"
        />
        <StatCard
          label="Hồ sơ chờ duyệt"
          value="45"
          icon={Clock}
          color="orange"
          isAlert
        />
        <StatCard
          label="Vi phạm"
          value="12"
          subValue="Cần xử lý ngay"
          icon={AlertCircle}
          color="red"
        />
        <StatCard label="Bị tố cáo" value="08" icon={Flag} color="slate" />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[2rem] overflow-hidden">
        {/* Title & Filter Header */}
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Danh sách hồ sơ Portfolio
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-50 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={16} /> Lọc dữ liệu
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-50 px-8 mt-4">
          {["Tất cả"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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
                {[
                  "PORTFOLIO ID",
                  "NGƯỜI DÙNG",
                  "LĨNH VỰC",
                  "NGÀY TẠO",
                  "TRẠNG THÁI",
                  "HÀNH ĐỘNG",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-slate-400 font-bold italic text-xs uppercase"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : (
                portfolios.map((pf) => (
                  <tr
                    key={pf.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">
                      {pf.id}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[11px] text-slate-500 border border-slate-200 uppercase overflow-hidden">
                          <img
                            src={pf.avatar}
                            alt={pf.userName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <span className="text-[14px] font-bold text-slate-700">
                          {pf.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] text-slate-500 font-medium">
                      {pf.studyField}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">
                      {pf.createdAt}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                          pf.status === "MAIN"
                            ? "bg-blue-50 text-blue-600"
                            : pf.status === "PUBLIC"
                              ? "bg-emerald-50 text-emerald-500"
                              : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {pf.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleViewPortfolio(pf.portfolioId)}
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
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            trong tổng số{" "}
            <span className="text-slate-700 font-bold">{totalItems}</span> hồ sơ
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-300 disabled:opacity-30"
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
              className="p-2 text-slate-300 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Detail Modal */}
      {selectedPortfolio && (
        <PortfolioDetailModal
          portfolio={selectedPortfolio}
          loading={detailLoading}
          onClose={() => setSelectedPortfolio(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

// --- Helper Stat Card ---
const StatCard = ({
  label,
  value,
  trend,
  subValue,
  icon: Icon,
  color,
  isAlert,
}: any) => (
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
      {trend && (
        <p className="text-[10px] font-bold mt-1 text-emerald-500 flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </p>
      )}
      {subValue && (
        <p className="text-[10px] font-bold mt-1 text-red-400">{subValue}</p>
      )}
      {isAlert && (
        <p className="text-[10px] font-bold mt-1 text-orange-400 uppercase tracking-widest">
          Cần xử lý ngay
        </p>
      )}
    </div>
  </div>
);

// --- Portfolio Detail Modal ---
interface PortfolioDetailModalProps {
  portfolio: PortfolioType;
  loading: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const PortfolioDetailModal = ({
  portfolio,
  loading,
  onClose,
  onApprove,
  onReject,
}: PortfolioDetailModalProps) => {
  // Get intro block data
  const introBlock = portfolio.blocks.find((b) => b.type === "INTRO");
  const introData = introBlock?.data as any;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-black text-slate-800">
            {portfolio.portfolioName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Đang tải dữ liệu...
            </div>
          ) : (
            <>
              {/* Basic Info */}
              {introData && (
                <div className="bg-slate-50 p-6 rounded-xl">
                  <div className="flex gap-6">
                    {introData.avatar && (
                      <img
                        src={introData.avatar}
                        alt={introData.name}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-800">
                        {introData.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {introData.studyField}
                      </p>
                      <div className="mt-3 space-y-1 text-sm text-slate-600">
                        {introData.email && (
                          <p>
                            <span className="font-bold text-slate-800">
                              Email:
                            </span>{" "}
                            {introData.email}
                          </p>
                        )}
                        {introData.phone && (
                          <p>
                            <span className="font-bold text-slate-800">
                              Phone:
                            </span>{" "}
                            {introData.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Blocks */}
              {portfolio.blocks.map((block) => (
                <PortfolioBlockRenderer key={block.id} block={block} />
              ))}

              {/* Ranking Info */}
              {portfolio.ranking && (
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h4 className="text-lg font-black text-slate-800 mb-3">
                    Xếp hạng
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Tổng điểm</p>
                      <p className="text-2xl font-black text-blue-600">
                        {portfolio.ranking.totalScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Điểm trung bình</p>
                      <p className="text-2xl font-black text-blue-600">
                        {portfolio.ranking.averageScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Vị trí xếp hạng</p>
                      <p className="text-2xl font-black text-blue-600">
                        {portfolio.ranking.rankPosition}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-100 bg-white">
          <button
            onClick={onReject}
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-red-300 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
          >
            Từ chối hồ sơ
          </button>
          <button
            onClick={onApprove}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            Duyệt hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Portfolio Block Renderer ---
interface PortfolioBlockRendererProps {
  block: any;
}

const PortfolioBlockRenderer = ({ block }: PortfolioBlockRendererProps) => {
  const blockType = block.type;
  const blockData = block.data;

  const renderBlockContent = () => {
    switch (blockType) {
      case "INTRO":
        return null; // Already rendered in basic info

      case "SKILL":
        return (
          <div>
            <h4 className="font-black text-slate-800 mb-3">Kỹ năng</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(blockData) &&
                blockData.map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold"
                  >
                    {skill.name}
                  </span>
                ))}
            </div>
          </div>
        );

      case "EDUCATION":
        return (
          <div>
            <h4 className="font-black text-slate-800 mb-3">Học vấn</h4>
            <div className="space-y-3">
              {Array.isArray(blockData) &&
                blockData.map((edu: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-slate-300 pl-4">
                    <p className="font-black text-slate-800">{edu.schoolName}</p>
                    <p className="text-sm text-slate-600">{edu.department}</p>
                    <p className="text-xs text-slate-500 mt-1">{edu.time}</p>
                  </div>
                ))}
            </div>
          </div>
        );

      case "EXPERIMENT":
        return (
          <div>
            <h4 className="font-black text-slate-800 mb-3">Kinh nghiệm làm việc</h4>
            <div className="space-y-3">
              {Array.isArray(blockData) &&
                blockData.map((exp: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-emerald-300 pl-4">
                    <p className="font-black text-slate-800">{exp.jobName}</p>
                    <p className="text-sm text-slate-600">{exp.address}</p>
                    <p className="text-xs text-slate-500 mt-1">{exp.time}</p>
                    {exp.description && (
                      <p className="text-sm text-slate-600 mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        );

      case "PROJECT":
        return (
          <div>
            <h4 className="font-black text-slate-800 mb-3">Dự án</h4>
            <div className="space-y-4">
              {Array.isArray(blockData) &&
                blockData.map((project: any, idx: number) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    {project.image && (
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <p className="font-black text-slate-800">{project.name}</p>
                    <p className="text-sm text-slate-600 mt-2">
                      {project.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      <span className="font-bold">Vai trò:</span> {project.role}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        );

      case "AWARD":
        return (
          <div>
            <h4 className="font-black text-slate-800 mb-3">Giải thưởng</h4>
            <div className="space-y-3">
              {Array.isArray(blockData) &&
                blockData.map((award: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-amber-50 border-l-4 border-amber-300 p-4 rounded"
                  >
                    <p className="font-black text-slate-800">{award.name}</p>
                    <p className="text-sm text-slate-600">{award.organization}</p>
                    <p className="text-xs text-slate-500 mt-1">{award.time}</p>
                  </div>
                ))}
            </div>
          </div>
        );

      case "ACTIVITIES":
        return (
          <div>
            <h4 className="font-black text-slate-800 mb-3">Hoạt động</h4>
            <div className="space-y-3">
              {Array.isArray(blockData) &&
                blockData.map((activity: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-purple-50 border-l-4 border-purple-300 p-4 rounded"
                  >
                    <p className="font-black text-slate-800">{activity.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                ))}
            </div>
          </div>
        );

      case "REFERENCE":
        return (
          <div>
            <h4 className="font-black text-slate-800 mb-3">Người tham chiếu</h4>
            <div className="space-y-3">
              {Array.isArray(blockData) &&
                blockData.map((ref: any, idx: number) => (
                  <div key={idx} className="border border-slate-200 p-4 rounded">
                    <p className="font-black text-slate-800">{ref.name}</p>
                    <p className="text-sm text-slate-600">{ref.position}</p>
                    <p className="text-sm text-slate-600">{ref.email}</p>
                  </div>
                ))}
            </div>
          </div>
        );

      case "OTHERINFO":
        return (
          <div>
            <h4 className="font-black text-slate-800 mb-3">Thông tin khác</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(blockData) &&
                blockData.map((info: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-bold"
                  >
                    {info.detail}
                  </span>
                ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (blockType === "INTRO") {
    return null; // Skip intro as it's already rendered
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl">
      {renderBlockContent()}
    </div>
  );
};

export default PortfolioManagement;
