import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hook";
import { CompanyPostDetail } from "@/types/company";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Check,
  CircleDollarSign,
  Clock3,
  Loader2,
  MapPin,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function JobPostDetails() {
  const navigate = useNavigate();
  // Lấy accessToken nếu cần dùng cho Header API, hiện tại fetch bên dưới chưa dùng tới
  const { accessToken } = useAppSelector((state) => state.auth);
  const { id } = useParams();
  const postId = Number(id);

  const [selectedPost, setSelectedPost] = useState<CompanyPostDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPostDetail = async () => {
      if (!postId) {
        setError("ID bài đăng không hợp lệ");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://company-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/company-posts/${postId}`,
          {
            // Nếu API yêu cầu token, hãy uncomment dòng dưới:
            // headers: { Authorization: `Bearer ${accessToken}` }
          },
        );
        if (!response.ok) throw new Error("Không thể lấy dữ liệu từ server");
        const data = await response.json();
        setSelectedPost(data);
      } catch (err) {
        setError("Có lỗi khi tải dữ liệu bài đăng");
      } finally {
        setIsLoading(false);
      }
    };
    loadPostDetail();
  }, [postId, accessToken]);

  // 1. Trạng thái Loading
  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
        <p className="font-medium">Đang tải chi tiết bài đăng...</p>
      </div>
    );
  }

  // 2. Trạng thái Lỗi hoặc Không có dữ liệu
  if (error || !selectedPost) {
    return (
      <div className="p-10 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
          <XCircle size={40} />
        </div>
        <p className="text-lg font-bold text-slate-800">
          {error || "Không tìm thấy bài đăng"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 font-semibold hover:underline"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Xử lý dữ liệu text thành danh sách
  const mandatoryRequirements = toBulletItems(
    selectedPost.requirementsMandatory || "",
  );
  const preferredRequirements = toBulletItems(
    selectedPost.requirementsPreferred || "",
  );
  const benefits = toBulletItems(selectedPost.benefits || "");

  // 3. Render giao diện chính
  return (
    <div className="p-4 bg-[#f7eccd]">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 transition-colors font-bold text-sm cursor-pointer"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      <div
        className={cn(
          "bg-white shadow-sm overflow-hidden rounded-3xl border border-slate-100",
        )}
      >
        {/* Header & Cover */}
        <div className="relative h-48 w-full">
          <img
            src={
              selectedPost.coverImageUrl ||
              "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
            }
            className="h-full w-full object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="relative px-6 pb-8">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
              <img
                src={
                  selectedPost.companyAvatar ||
                  "https://via.placeholder.com/150"
                }
                className="h-full w-full object-contain p-2"
                alt="logo"
              />
            </div>
          </div>

          <div className="pt-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                  {selectedPost.position}
                </h1>
                <div className="mt-2 flex items-center gap-2 font-bold text-blue-600">
                  <Building2 size={18} />
                  <span className="text-lg">{selectedPost.companyName}</span>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black text-emerald-600 uppercase tracking-widest">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {/* Nút Duyệt: Sử dụng màu xanh Emerald đậm */}
                <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black text-white uppercase tracking-widest shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 cursor-pointer">
                  <Check size={16} strokeWidth={3} />
                  Duyệt bài đăng
                </button>

                {/* Nút Từ chối: Sử dụng màu đỏ đậm */}
                <button className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-black text-white uppercase tracking-widest shadow-md shadow-red-200 transition-all hover:bg-red-700 hover:shadow-lg active:scale-95 cursor-pointer">
                  <X size={16} strokeWidth={3} />
                  Từ chối
                </button>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <InfoRow
                icon={<MapPin size={18} />}
                label="Địa điểm"
                text={selectedPost.address}
                isHighlight
              />
              <InfoRow
                icon={<CircleDollarSign size={18} />}
                label="Mức lương"
                text={selectedPost.salary}
                isHighlight
              />
              <InfoRow
                icon={<Briefcase size={18} />}
                label="Hình thức"
                text={selectedPost.employmentType}
                isHighlight
              />
              <InfoRow
                icon={<Clock3 size={18} />}
                label="Kinh nghiệm"
                text={`${selectedPost.experienceYear || 0} năm`}
                isHighlight
              />
              <InfoRow
                icon={<Users size={18} />}
                label="Số lượng"
                text={`${selectedPost.quantity || 0} người`}
                isHighlight
              />
            </div>

            <div className="mt-10 space-y-8">
              <DetailSection title="Mô tả công việc">
                <div className="whitespace-pre-line text-[15px] leading-relaxed text-slate-600">
                  {selectedPost.jobDescription ||
                    "Đang cập nhật nội dung mô tả..."}
                </div>
              </DetailSection>

              <DetailSection title="Yêu cầu ứng tuyển">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TagBox
                    tone="required"
                    label="Bắt buộc"
                    items={mandatoryRequirements.items}
                  />
                  <TagBox
                    tone="preferred"
                    label="Ưu tiên"
                    items={preferredRequirements.items}
                  />
                </div>
              </DetailSection>

              <DetailSection title="Quyền lợi & Đãi ngộ">
                <div className="rounded-2xl bg-slate-50 p-6">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {benefits.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-[15px] text-slate-600"
                      >
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </DetailSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Các Component bổ trợ ---

function InfoRow({
  icon,
  label,
  text,
  isHighlight,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  isHighlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-blue-100 hover:bg-white hover:shadow-sm">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          isHighlight
            ? "bg-blue-500 text-white"
            : "bg-white text-slate-400 shadow-sm",
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-bold",
            isHighlight ? "text-blue-500" : "text-slate-700",
          )}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-8 w-1.5 rounded-full bg-blue-600" />
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function TagBox({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "required" | "preferred";
}) {
  if (items.length === 0) return null;
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all",
        tone === "required"
          ? "border-red-100 bg-red-50/30"
          : "border-blue-100 bg-blue-50/30",
      )}
    >
      <span
        className={cn(
          "mb-4 inline-block rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest",
          tone === "required"
            ? "bg-red-500 text-white"
            : "bg-blue-600 text-white",
        )}
      >
        {label}
      </span>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm font-medium text-slate-600"
          >
            <div
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                tone === "required" ? "bg-red-400" : "bg-blue-400",
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function toBulletItems(rawText: string) {
  if (!rawText) return { items: [], isListFormat: false };
  const isListFormat = rawText.includes("\n");
  const separator = isListFormat ? "\n" : ",";
  const items = rawText
    .split(separator)
    .map((i) => i.trim())
    .filter(Boolean);
  return { items, isListFormat };
}
