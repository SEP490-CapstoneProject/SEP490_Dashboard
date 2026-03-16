import React, { useState } from "react";
import {
  Ban,
  Trash2,
  Edit3,
  RefreshCw,
  Folder,
  MessageSquare,
  Mail,
  Heart,
  Share2,
  MoreVertical,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  FolderKanban,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { allUsers } from "@/data/allUser";
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
// --- Sub-Components: Tab Portfolio ---
const PortfolioTab = () => {
  const portfolios = [
    {
      id: 1,
      title: "Hồ sơ xin việc",
      role: "NHÀ THIẾT KẾ UI/UX",
      desc: "Một nhà thiết kế sản phẩm đầy nhiệt huyết với hơn 5 năm kinh nghiệm...",
      status: "Đang dùng",
      statusColor: "bg-emerald-50 text-emerald-500",
    },
    {
      id: 2,
      title: "Hồ sơ xin việc",
      role: "NHÀ THIẾT KẾ UI/UX",
      desc: "Portfolio dự phòng cho các dự án thiết kế dạng di động...",
      status: "Bản nháp",
      statusColor: "bg-slate-100 text-slate-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 cursor-pointer">
      {portfolios.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-md transition-all"
        >
          <div className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                className="w-16 h-16 rounded-full bg-slate-100"
                alt="avt"
              />
              <span
                className={cn(
                  "absolute top-0 -right-8 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase",
                  item.statusColor,
                )}
              >
                {item.status}
              </span>
            </div>
            <button className="absolute right-6 text-slate-300">
              <MoreVertical size={16} />
            </button>
            <h3 className="text-sm font-black text-slate-800 leading-none">
              Alex Rivers
            </h3>
            <p className="text-[10px] font-bold text-blue-500 mt-1 ">
              {item.role}
            </p>
            <p className="text-[11px] text-slate-400 mt-3 line-clamp-2 px-4 leading-relaxed font-medium">
              {item.desc}
            </p>
          </div>
          <div className="bg-slate-50/50 py-3 text-center border-t border-slate-50 bg-slate-200">
            <span className="text-[12px] font-bold text-slate-700">
              {item.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Sub-Components: Tab Bài đăng cộng đồng ---
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
// --- Main Page Component ---
const UserProfileManagement = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Portfolio");

  // Tìm thông tin user dựa trên ID
  const user = allUsers.find((u) => u.id === id);

  // Nếu không tìm thấy user (phòng trường hợp ID sai)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Không tìm thấy người dùng!</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 underline"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 w-full h-screen bg-[#f8fafd] flex flex-col">
      {/* Nút quay lại cho tiện quản lý */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 transition-colors font-bold text-sm cursor-pointer"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>
      <div className="max-w-[1200px] mx-auto grid grid-cols-11 gap-8 w-full h-full">
        {/* CỘT TRÁI: USER CARD - Sử dụng sticky để giữ nguyên */}
        <aside className="col-span-4 sticky top-0 h-fit">
          <div className="bg-white rounded-2xl shadow-sm border-2 border-white overflow-hidden pb-8">
            <div className="h-32 bg-blue-500 relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white"
                    alt="avatar"
                  />
                  <div className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center px-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Alex Rivers
              </h2>
              <p className="text-sm font-bold text-slate-400">
                alex.rivers@design.com
              </p>
              <span className="inline-block mt-3 px-4 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-black uppercase rounded-full">
                Hoạt động
              </span>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer">
                  <Edit3 size={16} /> Sửa hồ sơ
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-100 transition-all cursor-pointer">
                  <Ban size={16} /> Khóa
                </button>
              </div>
            </div>

            <div className="mx-6 mt-8 p-5 bg-blue-50 rounded-[1.5rem] border border-blue-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Gói thành viên
              </p>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="text-[12px] font-black text-blue-600">
                  Premium Diamond
                </h4>
              </div>
              <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all cursor-pointer">
                <RefreshCw size={14} /> Gia hạn ngay
              </button>
            </div>
          </div>
        </aside>

        {/* CỘT PHẢI: TABS CONTENT - Quan trọng: Thêm h-full và overflow-hidden */}
        <main className="col-span-7 bg-white rounded-2xl shadow-sm border-2 border-white flex flex-col h-full overflow-hidden">
          {/* Tab Bar: Luôn giữ nguyên ở đầu cột phải */}
          <div className="flex border-b border-slate-50 px-8 pt-2 shrink-0 bg-white z-10">
            {[
              { id: "Portfolio", icon: FolderKanban },
              { id: "Bài đăng cộng đồng", icon: MessageSquare },
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
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Content Area: Chỉ cuộn riêng vùng này */}
          <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-slate-50/20">
            {activeTab === "Portfolio" && <PortfolioTab />}
            {activeTab === "Bài đăng cộng đồng" && <CommunityTab />}
            {activeTab === "Tin nhắn" && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Mail size={40} className="mb-4 opacity-20" />
                <p className="font-bold">
                  Tính năng tin nhắn đang được cập nhật
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfileManagement;
