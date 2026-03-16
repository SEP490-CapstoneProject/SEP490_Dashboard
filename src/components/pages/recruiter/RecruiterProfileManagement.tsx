import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Ban,
  Briefcase,
  MessageSquare,
  Mail,
  MapPin,
  Hash,
  Globe,
  RefreshCw,
  MoreVertical,
  Code2,
  Palette,
  Terminal,
  ArrowLeft,
  Heart,
  Share2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allRecruiters,
  getRecruiterById,
  Recruiter,
} from "@/data/allRecruiters";
const MOCK_POSTS = [
  {
    id: "p1",
    author: "Nguyễn Văn A",
    date: "24/5/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    content:
      "Hôm nay thời tiết thật đẹp để đi dạo quanh hồ Hoàn Kiếm. Cảm giác không khí trong lành và nhịp sống chậm lại thật là tuyệt vời! Mọi người đã có kế hoạch gì cho cuối tuần chưa? 🌿☀️ #Hanoi #Relaxing",
    image: null, // Có thể thay bằng link ảnh thật
    likes: 124,
    comments: 18,
  },
  {
    id: "p2",
    author: "Lê Thị Ngọc",
    date: "25/5/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ngooc",
    content:
      "Vừa hoàn thành dự án React đầu tay cùng SkillSnap! Một hành trình đầy thử thách nhưng thành quả rất xứng đáng. Cảm ơn mọi người đã hỗ trợ nhiệt tình. 🚀💻 #Frontend #Developer",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000",
    likes: 256,
    comments: 42,
  },
];
const CommunityTab = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    {MOCK_POSTS.map((post) => (
      <div
        key={post.id}
        className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Header: Avatar & Info */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-[1.25rem] bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 leading-none">
                {post.author}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                {post.date}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            {/* <button
              className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
              title="Khóa bài viết"
            >
              <Ban size={18} />
            </button> */}
            <button
              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              title="Xóa bài viết"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <p className="text-[14px] text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Media Section: Hiển thị ảnh nếu có, ngược lại hiện Placeholder */}
        <div className="aspect-video bg-slate-50 rounded-[1.25rem] border border-slate-100 flex items-center justify-center mb-4 overflow-hidden relative group">
          {post.image ? (
            <img
              src={post.image}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="post media"
            />
          ) : (
            <div className="opacity-10 grayscale flex flex-col items-center gap-2">
              <img
                src="/product-logo.png"
                className="w-12 h-12"
                alt="placeholder"
              />
              <span className="text-[10px] font-black uppercase tracking-widest">
                SkillSnap Community
              </span>
            </div>
          )}
        </div>

        {/* Interaction Footer */}
        <div className="flex items-center gap-6 pt-3 border-t border-slate-50">
          <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 text-[13px] font-bold transition-colors cursor-pointer">
            <Heart size={18} /> {post.likes}
          </button>
          <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 text-[13px] font-bold transition-colors cursor-pointer">
            <MessageSquare size={18} /> {post.comments}
          </button>
          <button className="text-slate-400 ml-auto hover:text-slate-800 transition-colors cursor-pointer">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    ))}
  </div>
);
// --- Sub-Components: Tab Tin tuyển dụng ---
const JobPostsTab = () => {
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer (React/NextJS)",
      status: "ĐANG TUYỂN",
      icon: Code2,
      color: "text-blue-500 bg-blue-50",
    },
    {
      id: 2,
      title: "Lead UI/UX Designer",
      status: "ĐANG TUYỂN",
      icon: Palette,
      color: "text-purple-500 bg-purple-50",
    },
    {
      id: 3,
      title: "Backend Engineer (Golang)",
      status: "ĐÃ ĐÓNG",
      icon: Terminal,
      color: "text-slate-500 bg-slate-50",
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="group bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition-all shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                job.color,
              )}
            >
              <job.icon size={22} />
            </div>
            <h4 className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h4>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                job.status === "ĐANG TUYỂN"
                  ? "bg-emerald-50 text-emerald-500"
                  : "bg-slate-100 text-slate-400",
              )}
            >
              {job.status}
            </span>
            <button className="text-slate-300 hover:text-slate-600 p-1">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const RecruiterProfileManagement = () => {
  const [activeTab, setActiveTab] = useState("Bài đăng tuyển dụng");

  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const recruiter = allRecruiters.find((u) => u.id === id);
  if (!recruiter) {
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

  return (
    <div className="p-8 flex-1 min-h-screen bg-[#f8fafd] overflow-y-auto no-scrollbar">
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
            style={{ backgroundImage: `url(${recruiter.bannerUrl})` }}
          />

          <div className="px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo động theo logoSeed */}
              <div className="relative -mt-12 shrink-0">
                <div className="w-32 h-32 rounded-2xl bg-slate-900 border-[6px] border-white shadow-xl flex items-center justify-center p-4">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${recruiter.logoSeed}`}
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
                      {recruiter.name}
                    </h2>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                        recruiter.status === "Hoạt động"
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-orange-50 text-orange-500",
                      )}
                    >
                      {recruiter.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                    {recruiter.description}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-500 rounded-xl text-[13px] font-black hover:bg-red-100 transition-all border border-red-100 cursor-pointer">
                  <Ban size={16} /> Khóa tài khoản
                </button>
              </div>
            </div>

            {/* Business Details Grid - Tận dụng dữ liệu thật */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 pt-8 border-t border-slate-50">
              <DetailBlock
                label="Lĩnh vực"
                value={recruiter.industry}
                icon={Globe}
              />
              <DetailBlock
                label="Địa chỉ"
                value={recruiter.location}
                icon={MapPin}
              />
              <DetailBlock
                label="Mã số thuế"
                value={recruiter.taxId}
                icon={Hash}
              />
              <DetailBlock
                label="Email liên hệ"
                value={recruiter.email}
                icon={Mail}
              />
            </div>
          </div>
        </div>

        {/* --- PHẦN 2: TABS VÀ GÓI DỊCH VỤ --- */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-8 items-start">
          <main className="md:col-span-8 bg-white rounded-[1.25rem] shadow-sm border-2 border-white flex flex-col min-h-[500px]">
            <div className="flex border-b border-slate-50 px-8">
              {[
                { id: "Bài đăng tuyển dụng", icon: Briefcase },
                { id: "Cộng đồng", icon: MessageSquare },
                { id: "Tin nhắn", icon: Mail },
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
              {activeTab === "Bài đăng tuyển dụng" && <JobPostsTab />}
              {activeTab === "Cộng đồng" && <CommunityTab />}
            </div>
          </main>

          {/* Right: Membership Info - Sử dụng dữ liệu plan & expiryDate */}
          <aside className="md:col-span-3 space-y-6 sticky top-8">
            <div className="bg-white rounded-[1.25rem] shadow-sm border-2 border-white p-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                Gói dịch vụ
              </p>

              <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 mb-6">
                <h5 className="text-lg font-black text-orange-600 leading-none">
                  Premium
                </h5>
                <p className="text-[11px] text-orange-400 font-bold mt-2 italic flex items-center gap-1">
                  Hết hạn: 1/1/2026 <RefreshCw size={12} />
                </p>
              </div>

              <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer">
                <RefreshCw size={18} /> Gia hạn ngay
              </button>
            </div>
          </aside>
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
