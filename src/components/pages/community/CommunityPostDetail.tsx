import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Components & Types
import { CommunityPostCard } from "./CommunityPostCard";

// Hooks & Services

import { notify } from "@/lib/toast";
import { CommunityPost, PostComment } from "@/types/community";
import { CommunityPostComment } from "./CommunityPostComment";

export default function CommunityPostDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Đây là postId từ URL
  const postId = Number(id); // Chuyển id từ string sang number nếu cần
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<CommunityPost>();
  const [postComments, setPostComments] = useState<PostComment[]>([]);

  const API_BASE_URL =
    "https://community-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api";

  // --- 2. FETCH DATA ---
  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);

    try {
      // 1. Định nghĩa các yêu cầu fetch riêng biệt
      const postFetch = fetch(`${API_BASE_URL}/community/posts/${postId}`);

      const commentsFetch = fetch(
        `${API_BASE_URL}/community/posts/${postId}/comments`,
      );

      // 2. Chạy song song cả hai
      const [postRes, commentRes] = await Promise.all([
        postFetch,
        commentsFetch,
      ]);

      // 3. Xử lý kết quả trả về
      if (postRes.ok) {
        const postData = await postRes.json();
        setPost(postData);
      }

      if (commentRes.ok) {
        const data = await commentRes.json();
        setPostComments(data.comments || []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      notify.error("Lỗi khi tải dữ liệu bài viết");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchData();
  }, [id]);

  return (
    <div className="bg-[#f7eccd] p-4">
      <div className="max-w-2xl mx-auto min-h-screen bg-white border-x border-slate-200 shadow-sm">
        <div className="py-6 px-4 sm:px-6">
          <header className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">Bài viết</h1>
          </header>

          <div className="mb-6">
            {isLoading || !post ? (
              <div className="animate-pulse bg-gray-100 h-64 rounded-xl mb-6" />
            ) : (
              <CommunityPostCard
                key={post.id}
                {...post}
                authorId={post.author.id}
                author={post.author.name}
                avatar={post.author.avatar}
                isVerified={post.author.role === "COMPANY"}
                content={post.description || ""}
                images={post.media || []}
                likes={post.favoriteCount}
                comments={post.commentCount}
                time={post.createdAt}
              />
            )}
          </div>

          <div className="border-t pt-6 mb-24">
            <h3 className="font-bold text-lg mb-6">
              Bình luận ({postComments.length})
            </h3>
            <div className="space-y-6">
              {postComments.map((item) => (
                <CommunityPostComment key={item.id} comment={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
