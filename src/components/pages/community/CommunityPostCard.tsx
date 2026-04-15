import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Reply,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { formatTimeAgo } from "@/utils/FormatTime";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { notify } from "@/lib/toast";
import { ConfirmDeleteModal } from "../user/ConfirmDeleteModal";

interface PostProps {
  id: number;
  author: string;
  authorId: number;
  time: string;
  avatar: string;
  isVerified?: boolean;
  content: string;
  images?: string[]; // Đổi từ image thành images mảng
  imageTitle?: string;
  likes: number;
  comments: number;
  isFavorited: boolean;
  isSaved: boolean;
  onDeletePost?: (id: number) => void;
}

export const CommunityPostCard: React.FC<PostProps> = ({
  id,
  author,
  time,
  avatar,
  isVerified,
  content,
  images = [], // Mặc định là mảng rỗng
  likes,
  comments,
  isFavorited: initialIsFavorited,
  isSaved: initialIsSaved
}) => {
  // Hàm render layout hình ảnh dựa trên số lượng
  const renderImages = () => {
    const count = images.length;
    if (count === 0) return null;

    if (count === 1) {
      return (
        <div className="relative mt-4 rounded-xl overflow-hidden border border-gray-100">
          <img
            src={images[0]}
            alt="Post content"
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 mt-4 rounded-xl overflow-hidden">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-full aspect-square object-cover"
              alt=""
            />
          ))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 mt-4 rounded-xl overflow-hidden">
          <img
            src={images[0]}
            className="w-full h-full aspect-square object-cover row-span-2"
            alt=""
          />
          <img
            src={images[1]}
            className="w-full aspect-square object-cover"
            alt=""
          />
          <img
            src={images[2]}
            className="w-full aspect-square object-cover"
            alt=""
          />
        </div>
      );
    }

    // Từ 4 ảnh trở lên
    return (
      <div className="grid grid-cols-2 gap-1 mt-4 rounded-xl overflow-hidden relative">
        {images.slice(0, 4).map((img, i) => (
          <div key={i} className="relative">
            <img
              src={img || ""}
              className="w-full aspect-square object-cover"
              alt="Hình ảnh"
            />
            {/* Nếu nhiều hơn 4 ảnh, hiển thị lớp phủ mờ ở ảnh cuối cùng */}
            {i === 3 && count > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  +{count - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  const [localIsFavorited, setLocalIsFavorited] = useState(initialIsFavorited);
  const [localLikesCount, setLocalLikesCount] = useState(likes);
  const [localIsSaved, setLocalIsSaved] = useState(initialIsSaved);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { accessToken } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  // Xử lý click outside để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.body.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.body.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleFavoriteAction = async () => {
    try {
      const response = await fetch(
        `https://community-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/community/posts/${id}/favorite`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!response.ok) throw new Error();
      notify.success("Đã thích bài viết");
    } catch (error) {
      // Nếu lỗi, trả về trạng thái cũ
      setLocalIsFavorited(false);
      setLocalLikesCount((prev) => prev - 1);
      notify.error("Không thể thích bài viết");
    }
  };

  const handleUnfavoriteAction = async () => {
    try {
      const response = await fetch(
        `https://community-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/community/posts/${id}/favorite`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!response.ok) throw new Error();
      notify.success("Đã bỏ thích bài viết");
    } catch (error) {
      // Nếu lỗi, trả về trạng thái cũ
      setLocalIsFavorited(true);
      setLocalLikesCount((prev) => prev + 1);
      notify.error("Không thể bỏ thích bài viết");
    }
  };

  const handleFavoriteClick = async () => {
    if (isActionLoading) return;

    const currentlyFavorited = localIsFavorited;
    const willBeFavorited = !currentlyFavorited;

    // Optimistic Update: Cập nhật UI ngay lập tức
    setLocalIsFavorited(willBeFavorited);
    setLocalLikesCount((prev) => (willBeFavorited ? prev + 1 : prev - 1));

    setIsActionLoading(true);

    // Gọi hàm tương ứng dựa trên trạng thái hiện tại
    if (currentlyFavorited) {
      await handleUnfavoriteAction();
    } else {
      await handleFavoriteAction();
    }

    setIsActionLoading(false);
  };

  const handleSaveAction = async () => {
    try {
      const response = await fetch(
        `https://community-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/community/posts/${id}/save`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!response.ok) throw new Error();
      notify.success("Đã lưu bài viết");
    } catch (error) {
      setLocalIsSaved(false); // Rollback
      notify.error("Không thể lưu bài viết");
    }
  };

  const handleUnsaveAction = async () => {
    try {
      const response = await fetch(
        `https://community-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/community/posts/${id}/save`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!response.ok) throw new Error();
      notify.success("Đã bỏ lưu bài viết");
    } catch (error) {
      setLocalIsSaved(true); // Rollback
      notify.error("Không thể bỏ lưu bài viết");
    }
  };

  const handleSaveClick = async () => {
    if (isActionLoading) return;

    const currentlySaved = localIsSaved;
    setLocalIsSaved(!currentlySaved); // Optimistic Update
    setIsActionLoading(true);

    if (currentlySaved) {
      await handleUnsaveAction();
    } else {
      await handleSaveAction();
    }

    setIsActionLoading(false);
  };
  const handleDeleteUser = async (postId: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://community-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/community/posts/${postId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (response.ok) {
        notify.success("Xóa bài viết thành công");
        navigate("/dashboard/community-posts");
      }
    } catch (error) {
      notify.error("Không thể xóa bài viết");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      <div className="p-4">
        {/* Header: Avatar & Name */}
        <div className="flex items-start justify-between">
          <div className="flex space-x-3">
            <div className="relative">
              <img
                alt={"Avatar"}
                className="w-12 h-12 object-cover rounded-full"
                src={avatar || "/default-avatar.png"}
              />
              {isVerified && (
                <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                  <img
                    src="/blue-tick-company.png"
                    alt="Verified"
                    className="w-5 h-5 bg-white rounded-full border-2 border-white"
                  />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">
                {author}
              </h3>
              <p className="text-xs text-gray-500">{formatTimeAgo(time)}</p>
            </div>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <MoreHorizontal size={20} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1">
                  {/* Option 1: Luôn hiển thị */}
                  {/* <button
                    onClick={() => {
                      notify.info("Đã gửi báo cáo bài viết");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Flag size={16} className="text-gray-400" />
                    Báo cáo bài viết
                  </button> */}
                  <button
                    onClick={() => {
                      setShowDropdown(false); // Đóng menu dropdown
                      setIsDeleteModalOpen(true); // <--- THÊM DÒNG NÀY để mở Modal
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium cursor-pointer border-t border-gray-50"
                  >
                    <Trash2 size={16} />
                    Xóa bài viết
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Link */}
        <Link to={`/community/${id}`} className="block mt-4 group">
          <p
            className="text-gray-800 leading-relaxed transition-colors mb-2"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {renderImages()}
        </Link>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-12 px-6 py-3 border-t border-gray-100">
        {/* Nút Like (Heart) */}
        <button
          onClick={handleFavoriteClick}
          disabled={isActionLoading}
          className={`flex items-center cursor-pointer space-x-1.5 transition-all px-2 py-1 rounded-md active:scale-95 ${
            localIsFavorited
              ? "text-red-500 bg-red-50"
              : "text-gray-500 hover:text-red-500 hover:bg-gray-100"
          }`}
        >
          <Heart size={18} fill={localIsFavorited ? "currentColor" : "none"} />
          <span className="text-xs font-medium">{localLikesCount}</span>
        </button>

        {/* Nút Comment */}
        <div className="flex items-center cursor-pointer space-x-1.5 text-gray-500 hover:text-blue-500 hover:bg-gray-100 transition-colors px-2 py-1 rounded-md">
          <MessageCircle size={18} />
          <span className="text-xs font-medium">{comments}</span>
        </div>

        {/* Nút Save (Bookmark) */}
        <button
          onClick={handleSaveClick}
          disabled={isActionLoading}
          className={`cursor-pointer transition-all p-1.5 rounded-md active:scale-95 ${
            localIsSaved
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-blue-500 hover:bg-gray-100"
          }`}
        >
          <Bookmark size={18} fill={localIsSaved ? "currentColor" : "none"} />
        </button>

        <button className="text-gray-500 cursor-pointer hover:text-blue-500 transition-colors">
          <Reply size={18} className="rotate-180" />
        </button>
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDeleteUser(id)}
        isLoading={isDeleting}
        title="Xóa bài viết?"
        description={`Bạn có chắc chắn muốn xóa bài viết của ${author}? Dữ liệu của người dùng này sẽ bị mất vĩnh viễn.`}
      />
    </article>
  );
};
