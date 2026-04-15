import { CommunityPost } from "@/types/community";
import { useEffect, useState } from "react";
import { CommunityPostCard } from "../community/CommunityPostCard";
import { Loader2 } from "lucide-react"; // Thêm icon loading nếu muốn

export const CommunityTab = ({ userId }: { userId: number }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true); // 1. Khởi tạo loading = true

  useEffect(() => {
    const fetchUserCommunityPosts = async () => {
      setLoading(true); // Bắt đầu load
      try {
        const response = await fetch(`https://community-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/community/posts/user/${userId}`);
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
