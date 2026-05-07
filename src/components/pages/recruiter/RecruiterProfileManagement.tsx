import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Ban,
  Briefcase,
  MessageSquare,
  Mail,
  MapPin,
  Hash,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Recruiter } from "@/types/user";
import { handleEnumStatus } from "@/utils/FormatTime";
import { CommunityTab } from "../user/CommunityTab";
import { notify } from "@/lib/toast";
import { useAppSelector } from "@/store/hook";
import JobPostsTab from "./JobPostTab";
// const MOCK_POSTS = [
//   {
//     id: "p1",
//     author: "Nguyễn Văn A",
//     date: "24/5/2024",
//     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
//     content:
//       "Hôm nay thời tiết thật đẹp để đi dạo quanh hồ Hoàn Kiếm. Cảm giác không khí trong lành và nhịp sống chậm lại thật là tuyệt vời! Mọi người đã có kế hoạch gì cho cuối tuần chưa? 🌿☀️ #Hanoi #Relaxing",
//     image: null, // Có thể thay bằng link ảnh thật
//     likes: 124,
//     comments: 18,
//   },
//   {
//     id: "p2",
//     author: "Lê Thị Ngọc",
//     date: "25/5/2024",
//     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ngooc",
//     content:
//       "Vừa hoàn thành dự án React đầu tay cùng SkillSnap! Một hành trình đầy thử thách nhưng thành quả rất xứng đáng. Cảm ơn mọi người đã hỗ trợ nhiệt tình. 🚀💻 #Frontend #Developer",
//     image:
//       "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000",
//     likes: 256,
//     comments: 42,
//   },
// ];
// --- Sub-Components: Tab Tin tuyển dụng ---
// const JobPostsTab = () => {
//   const jobs = [
//     {
//       id: 1,
//       title: "Senior Frontend Developer (React/NextJS)",
//       status: "ĐANG TUYỂN",
//       icon: Code2,
//       color: "text-blue-500 bg-blue-50",
//     },
//     {
//       id: 2,
//       title: "Lead UI/UX Designer",
//       status: "ĐANG TUYỂN",
//       icon: Palette,
//       color: "text-purple-500 bg-purple-50",
//     },
//     {
//       id: 3,
//       title: "Backend Engineer (Golang)",
//       status: "ĐÃ ĐÓNG",
//       icon: Terminal,
//       color: "text-slate-500 bg-slate-50",
//     },
//   ];

//   return (
//     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
//       {jobs.map((job) => (
//         <div
//           key={job.id}
//           className="group bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition-all shadow-sm"
//         >
//           <div className="flex items-center gap-4">
//             <div
//               className={cn(
//                 "w-12 h-12 rounded-xl flex items-center justify-center",
//                 job.color,
//               )}
//             >
//               <job.icon size={22} />
//             </div>
//             <h4 className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
//               {job.title}
//             </h4>
//           </div>
//           <div className="flex items-center gap-4">
//             <span
//               className={cn(
//                 "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
//                 job.status === "ĐANG TUYỂN"
//                   ? "bg-emerald-50 text-emerald-500"
//                   : "bg-slate-100 text-slate-400",
//               )}
//             >
//               {job.status}
//             </span>
//             <button className="text-slate-300 hover:text-slate-600 p-1">
//               <MoreVertical size={18} />
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

const RecruiterProfileManagement = () => {
  const [activeTab, setActiveTab] = useState("Bài đăng tuyển dụng");
  const [recruiterProfile, setRecruiterProfile] = useState<Recruiter>();
  const { id } = useParams(); // Lấy ID từ URL
  const userId = Number(id);
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((state) => state.auth);
  const fetchRecruiterById = async () => {
    try {
      const response = await fetch(
        `https://userprofile-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/Company/${userId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setRecruiterProfile(data);
      }
    } catch (error) {}
  };
  useEffect(() => {
    fetchRecruiterById();
  }, []);

  if (!recruiterProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafd]">
        <p className="text-slate-400 font-bold mb-4">
          Không tìm thấy dữ liệu nhà tuyển dụng
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>
    );
  }
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
        fetchRecruiterById();
      } else {
        notify.error("Lỗi khi khóa người dùng");
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
        fetchRecruiterById();
      } else {
        notify.error("Lỗi khi mở khóa người dùng");
      }
    } catch (error) {}
  };
  return (
    <div className="p-4 flex-1 min-h-screen bg-[#f7eccd] overflow-y-auto no-scrollbar">
      {/* Nút quay lại cho tiện quản lý */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 transition-colors font-bold text-sm cursor-pointer"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* --- PHẦN 1: BANNER & THÔNG TIN DOANH NGHIỆP --- */}
        <div className="bg-white rounded-[1.25rem] shadow-sm border-2 border-white overflow-hidden">
          {/* Banner động theo recruiter.bannerUrl */}
          <div
            className="h-48 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${recruiterProfile.coverImage || "/default"})`,
            }}
          />

          <div className="px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo động theo logoSeed */}
              <div className="relative -mt-12 shrink-0">
                <div className="w-32 h-32 rounded-2xl bg-slate-900 border-[6px] border-white shadow-xl flex items-center justify-center p-4">
                  <img
                    src={recruiterProfile.avatar || "/default"}
                    alt="logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Title & Action */}
              <div className="mt-4 flex-1 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                      {recruiterProfile.companyName}
                    </h2>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                        recruiterProfile.status === "Active"
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-red-50 text-red-500",
                      )}
                    >
                      {handleEnumStatus(recruiterProfile.status)}{" "}
                      {/* {user.status} {} */}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                    {recruiterProfile.description}
                  </p>
                </div>
                {recruiterProfile.status === "Active" && (
                  <button
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[13px] font-black hover:bg-slate-100 transition-all border border-red-100 cursor-pointer"
                    onClick={() => handleLockUser(recruiterProfile.userId)}
                  >
                    <Ban size={16} /> Khóa tài khoản
                  </button>
                )}
                {recruiterProfile.status === "Locked" && (
                  <button
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-500 rounded-xl text-[13px] font-black hover:bg-red-100 transition-all border border-red-100 cursor-pointer"
                    onClick={() => handleUnLockUser(recruiterProfile.userId)}
                  >
                    <Ban size={16} /> Mở khóa tài khoản
                  </button>
                )}
              </div>
            </div>

            {/* Business Details Grid - Tận dụng dữ liệu thật */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 pt-8 border-t border-slate-50">
              <DetailBlock
                label="Lĩnh vực"
                value={recruiterProfile.activityField}
                icon={Globe}
              />
              <DetailBlock
                label="Địa chỉ"
                value={recruiterProfile.address}
                icon={MapPin}
              />
              <DetailBlock
                label="Mã số thuế"
                value={recruiterProfile.taxIdentification}
                icon={Hash}
              />
              <DetailBlock
                label="Email liên hệ"
                value={recruiterProfile.email}
                icon={Mail}
              />
            </div>
          </div>
        </div>

        {/* --- PHẦN 2: TABS VÀ GÓI DỊCH VỤ --- */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-8 items-center mx-auto">
          <main className="md:col-span-8 bg-white rounded-[1.25rem] shadow-sm border-2 border-white flex flex-col min-h-[500px]">
            <div className="flex border-b border-slate-50 px-8">
              {[
                { id: "Bài đăng tuyển dụng", icon: Briefcase },
                { id: "Cộng đồng", icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-6 px-4 text-[13px] font-bold transition-all relative cursor-pointer",
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-slate-400 hover:text-slate-600",
                  )}
                >
                  <tab.icon size={18} />
                  {tab.id}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-left-2" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8 bg-slate-50/20 flex-1">
              {activeTab === "Bài đăng tuyển dụng" && <JobPostsTab userId={recruiterProfile.userId} />}
              {activeTab === "Cộng đồng" && (
                <CommunityTab userId={recruiterProfile.userId} />
              )}
            </div>
          </main>

          {/* Right: Membership Info - Sử dụng dữ liệu plan & expiryDate */}
          {/* <aside className="md:col-span-3 space-y-6 sticky top-8">
            <div className="bg-white rounded-[1.25rem] shadow-sm border-2 border-white p-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                Gói dịch vụ
              </p>

              <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 mb-6">
                <h5 className="text-lg font-black text-blue-600 leading-none">
                  Premium
                </h5>
                <p className="text-[11px] text-blue-400 font-bold mt-2 italic flex items-center gap-1">
                  Hết hạn: 1/1/2026 <RefreshCw size={12} />
                </p>
              </div>

              <button className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer">
                <RefreshCw size={18} /> Gia hạn ngay
              </button>
            </div>
          </aside> */}
        </div>
      </div>
    </div>
  );
};

type DetailBlockProps = {
  label: string;
  value: string;
  icon?: React.ElementType;
};

const DetailBlock = ({ label, value, icon: Icon }: DetailBlockProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
      {Icon && <Icon size={12} className="inline-block mr-1" />}
      {label}
    </p>
    <p className="text-[13px] font-bold text-slate-700 leading-snug">{value}</p>
  </div>
);

export default RecruiterProfileManagement;
