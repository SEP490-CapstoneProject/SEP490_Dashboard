
import { PostComment } from "@/types/community";
import { formatTimeAgo } from "@/utils/FormatTime";

interface CommentProps {
  comment: PostComment;
}

export const CommunityPostComment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="relative">
      <CommentItem 
        author={comment.author} 
        content={comment.content} 
        createdAt={comment.createdAt} 
        isReply={false} 
      />

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-2 space-y-3 relative">
          <div className="absolute -left-6 top-0 bottom-6 w-0.5 bg-gray-100" />
          {comment.replies.map((reply) => (
            <div key={reply.id} className="relative">
              <div className="absolute -left-6 top-5 w-4 h-0.5 bg-gray-100" />
              <CommentItem
                author={reply.author}
                content={reply.content}
                createdAt={reply.createdAt}
                replyToUser={reply.replyToUser}
                isReply={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ItemProps {
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  createdAt: string;
  isReply: boolean;
  replyToUser?: {
    name: string;
  };
}

const CommentItem = ({ author, content, createdAt, isReply, replyToUser }: ItemProps) => {
  return (
    <div className="flex gap-3 mb-2">
      <img
        src={author.avatar || "/default-avatar.png"}
        className="w-10 h-10 rounded-full z-10 bg-white object-cover shadow-sm"
        alt={author.name}
      />

      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block max-w-full">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-bold text-sm text-gray-900 leading-none">
              {author.name}
            </h4>
            {author.role === "COMPANY" && (
              <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                Company
              </span>
            )}
            <span className="text-[11px] text-gray-400 font-medium ml-1">
              {formatTimeAgo(createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {isReply && replyToUser && (
              <span className="text-blue-500 font-medium mr-1">
                @{replyToUser.name}
              </span>
            )}
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};