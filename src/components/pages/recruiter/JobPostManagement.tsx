import React, { useState, useEffect } from "react";
import { 
  Eye, Ban, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, FileText, 
  Clock, AlertCircle, Flag, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface JobPost {
  id: string;
  company: string;
  logoText: string;
  title: string;
  postedDate: string;
  reason: string;
  status: "ĐANG HOẠT ĐỘNG" | "CHỜ DUYỆT" | "BỊ TỐ CÁO" | "VI PHẠM";
}

interface PaginationResponse {
  data: JobPost[];
  totalItems: number;
  totalPages: number;
}

// --- Mock Data Backend ---
const fetchJobsFromBackend = async (
  pageNum: number, 
  pageSize: number, 
  filterTab: string
): Promise<PaginationResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const ALL_JOBS: JobPost[] = [
    { id: "1", company: "Công ty Công nghS ABC", logoText: "ABC", title: "Kỹ sư Phần mềm Senior (Fullstack)", postedDate: "20/10/2023", reason: "--", status: "ĐANG HOẠT ĐỘNG" },
    { id: "2", company: "Tập đoàn Tài chính XYZ", logoText: "XYZ", title: "Chuyên viên Phân tích dữ liệu", postedDate: "19/10/2023", reason: "--", status: "CHỜ DUYỆT" },
    { id: "3", company: "Startup Sáng tạo", logoText: "SS", title: "UI/UX Designer", postedDate: "18/10/2023", reason: "Nội dung phản cảm", status: "BỊ TỐ CÁO" },
    { id: "4", company: "Logistics Toàn Cầu", logoText: "LGC", title: "Nhân viên Kho vận", postedDate: "17/10/2023", reason: "Spam/Lặp lại", status: "VI PHẠM" },
    { id: "5", company: "Công ty Giáo dục ED", logoText: "ED", title: "Giáo viên Tiếng Anh", postedDate: "16/10/2023", reason: "--", status: "ĐANG HOẠT ĐỘNG" },
  ];

  let filtered = ALL_JOBS;
  if (filterTab === "Bị tố cáo") filtered = ALL_JOBS.filter(j => j.status === "BỊ TỐ CÁO");
  if (filterTab === "Vi phạm") filtered = ALL_JOBS.filter(j => j.status === "VI PHẠM");

  const start = (pageNum - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
};

const JobPostManagement = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 4;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await fetchJobsFromBackend(currentPage, pageSize, activeTab);
      setJobs(res.data);
      setTotalItems(res.totalItems);
      setTotalPages(res.totalPages);
      setLoading(false);
    };
    loadData();
  }, [currentPage, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafd] p-8 animate-in fade-in duration-500">
      
      {/* 1. Stats Cards Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Tổng bài đăng" value="1,250" subValue="+5.2%" icon={FileText} color="blue" />
        <StatCard label="Hồ sơ chờ duyệt" value="45" icon={Clock} color="orange" isAlert />
        <StatCard label="Vi phạm" value="12" subValue="Cần xử lý ngay" icon={AlertCircle} color="red" />
        <StatCard label="Bị tố cáo" value="08" icon={Flag} color="slate" />
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border-2 border-white shadow-sm rounded-[2rem] overflow-hidden">
        
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-50 px-8">
          {["Tất cả", "Bị tố cáo", "Vi phạm"].map((tab) => (
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

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                {["DOANH NGHIỆP", "TIÊU ĐỀ CÔNG VIỆC", "NGÀY ĐĂNG", "LÝ DO", "TRẠNG THÁI", "HÀNH ĐỘNG"].map((h) => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold italic text-xs uppercase">Đang tải dữ liệu...</td></tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 border border-slate-200 uppercase">
                          {job.logoText}
                        </div>
                        <span className="text-[14px] font-bold text-slate-700">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] text-slate-500 font-medium max-w-[200px] leading-relaxed">
                      {job.title}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">
                      {job.postedDate}
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "text-[11px] font-bold",
                        job.status === "VI PHẠM" ? "text-red-500" : 
                        job.status === "BỊ TỐ CÁO" ? "text-orange-600" : "text-slate-300"
                      )}>
                        {job.reason}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                        job.status === "ĐANG HOẠT ĐỘNG" ? "bg-emerald-50 text-emerald-500" :
                        job.status === "CHỜ DUYỆT" ? "bg-slate-100 text-slate-500" :
                        job.status === "BỊ TỐ CÁO" ? "bg-orange-50 text-orange-500" : "bg-red-50 text-red-500"
                      )}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1">
                        {job.status === "CHỜ DUYỆT" ? (
                          <>
                            <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle2 size={18} /></button>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><XCircle size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-blue-500"><Eye size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                            <button className={cn("p-2 rounded-lg transition-all", job.status === "VI PHẠM" ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-red-500 hover:bg-red-50")}><Ban size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-slate-50/20 flex justify-between items-center border-t border-slate-50">
          <p className="text-[12px] text-slate-400 font-medium">
            Hiển thị <span className="text-slate-700 font-bold">{(currentPage-1)*pageSize+1}-{Math.min(currentPage*pageSize, totalItems)}</span> trong tổng số <span className="text-slate-700 font-bold">{totalItems}</span> bài đăng
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-2 text-slate-300 disabled:opacity-30"><ChevronLeft size={18} /></button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i+1)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[12px] font-black transition-all",
                  currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-white"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="p-2 text-slate-300 disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const StatCard = ({ label, value, subValue, icon: Icon, color, isAlert }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-white flex flex-col justify-between h-44 group">
    <div className="flex justify-between items-start">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
        color === 'blue' ? 'bg-blue-50 text-blue-500' : 
        color === 'orange' ? 'bg-orange-50 text-orange-500' :
        color === 'red' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
      )}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      {subValue && (
        <p className={cn("text-[10px] font-bold mt-2 flex items-center gap-1", 
          color === 'blue' ? 'text-emerald-500 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg' : 'text-red-400')}>
          {subValue}
        </p>
      )}
      {isAlert && <p className="text-[10px] font-bold mt-2 text-orange-400 tracking-wider uppercase">Cần xử lý ngay</p>}
    </div>
  </div>
);

export default JobPostManagement;