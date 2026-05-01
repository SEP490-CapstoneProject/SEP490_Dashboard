import { useState, useEffect } from "react";
import {
  Code2,
  Briefcase,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { CompanyPost } from "@/types/company"; // Giả định path type của bạn

interface JobPostsTabProps {
  userId: number;
}

const JobPostsTab = ({ userId }: JobPostsTabProps) => {
  const [jobs, setJobs] = useState<CompanyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const limit = 10;

  // Hàm mapping status từ số sang text và style
  // const getStatusInfo = (status: number) => {
  //   switch (status) {
  //     case 1: // Giả định 1 là Đang tuyển
  //       return {
  //         label: "ĐANG TUYỂN",
  //         classes: "bg-emerald-50 text-emerald-500",
  //       };
  //     case 0: // Giả định 0 là Đã đóng
  //       return { label: "ĐÃ ĐÓNG", classes: "bg-slate-100 text-slate-400" };
  //     default:
  //       return { label: "TẠM DỪNG", classes: "bg-amber-50 text-amber-500" };
  //   }
  // };

  const fetchJobs = async (cursor: string | null = null) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);

    try {
      const getCompanyId = await fetch(
        `https://userprofile-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/Company/by-user/${userId}`,
      );
      const companyData = await getCompanyId.json();
      const companyId = companyData.id;
      const url = new URL(
        `https://company-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/company-posts/company/${companyId}`,
      );
      url.searchParams.append("limit", limit.toString());
      if (cursor) url.searchParams.append("cursor", cursor);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Danh sách công việc đã tải:", data);
        console.log("✅ Danh sách công việc đã tải:", data.items);
        // Nếu là load more thì cộng dồn, nếu load đầu thì reset
        if (cursor) {
          setJobs((prev) => [...prev, ...data.items]);
        } else {
          setJobs(data.items);
        }

        // API Cursor thường trả về nextCursor hoặc null nếu hết data
        setNextCursor(data.nextCursor || null);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách công việc:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchJobs();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Loader2 className="animate-spin mb-2" size={24} />
        <span className="text-sm font-medium">
          Đang tải danh sách công việc...
        </span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed">
        <p className="text-slate-400 text-sm">
          Doanh nghiệp chưa có bài đăng tuyển dụng nào.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {jobs.map((job) => {
        // const statusInfo = getStatusInfo(job.status);

        return (
          <div
            key={job.postId}
            className="group bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500">
                <Code2 size={22} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {job.position}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Briefcase size={12} /> {job.employmentType}
                  </span>
                  <span className="text-xs text-blue-500 font-bold">
                    {job.salary}
                  </span>
                </div>
              </div>
            </div>
            {/* 
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                  statusInfo.classes,
                )}
              >
                {statusInfo.label}
              </span>
              <button className="text-slate-300 hover:text-slate-600 p-1">
                <MoreVertical size={18} />
              </button>
            </div> */}
          </div>
        );
      })}

      {/* Nút Xem thêm (Cursor Pagination) */}
      {nextCursor && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => fetchJobs(nextCursor)}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
            {loadingMore ? "Đang tải..." : "Xem thêm công việc"}
          </button>
        </div>
      )}
    </div>
  );
};

export default JobPostsTab;
