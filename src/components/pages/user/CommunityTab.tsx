import { CommunityPost } from "@/types/community";
import { useEffect, useState } from "react";
import { CommunityPostCard } from "../community/CommunityPostCard";
import { Loader2 } from "lucide-react"; // Thêm icon loading nếu muốn
import { useAppSelector } from "@/store/hook";

export const CommunityTab = ({ userId }: { userId: number }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true); // 1. Khởi tạo loading = true
    const { accessToken } = useAppSelector((state) => state.auth);
  const BASE_URL = "https://community-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api";
  useEffect(() => {
    const fetchUserCommunityPosts = async () => {
      setLoading(true); // Bắt đầu load
      try {
        const response = await fetch(`${BASE_URL}/community/posts/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }

        );
        console.log("userid:", userId);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false); // Kết thúc load (dù thành công hay thất bại)
      }
    };

    fetchUserCommunityPosts();
  }, [userId]);

  // 2. Xử lý logic hiển thị
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        Không có bài viết nào để hiển thị.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post: CommunityPost) => (
        <CommunityPostCard
          id={post.id}
          key={post.id}
          author={post.author.name}
          authorId={post.author.id}
          time={post.createdAt}
          avatar={post.author.avatar}
          isVerified={post.author.role === "COMPANY"}
          content={post.description || ""}
          images={post?.media && post?.media.length > 0 ? post?.media : []}
          imageTitle={post.portfolioPreview?.data?.title || ""}
          likes={post.favoriteCount}
          comments={post.commentCount}
          isFavorited={post.isFavorited}
          isSaved={post.isSaved}
        />
      ))}
    </div>
  );
};
