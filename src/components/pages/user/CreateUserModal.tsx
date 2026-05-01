import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react"; // Import Loader2
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";

interface CreateUserModalProps {
  isOpen: boolean;
  role: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateUserModal = ({
  isOpen,
  onClose,
  role,
  onSuccess,
}: CreateUserModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. Thêm state loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 2. Bắt đầu loading
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://auth-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/Auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role: role }),
        },
      );

      if (response.ok && role === 1) {
        notify.success("Tạo người dùng mới thành công!");
        if (onSuccess) onSuccess();
        onClose();
        setEmail("");
        setPassword("");
      } else if (response.ok && role === 2) {
        notify.success("Tạo nhà tuyển dụng mới thành công!");
        if (onSuccess) onSuccess();
        onClose();
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      notify.error("Không thể kết nối đến máy chủ.");
    } finally {
      // 3. Kết thúc loading bất kể thành công hay thất bại
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          {role === 1 ? (
            <h2 className="text-2xl font-black text-slate-800">
              Thêm người dùng
            </h2>
          ) : (
            <h2 className="text-2xl font-black text-slate-800">
              Thêm nhà tuyển dụng
            </h2>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase ml-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="email"
                required
                disabled={isSubmitting} // Vô hiệu hóa input khi đang loading
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase ml-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={isSubmitting} // Vô hiệu hóa input khi đang loading
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button với Loading hiệu ứng */}
          <button
            type="submit"
            disabled={isSubmitting} // Không cho nhấn khi đang load
            className={cn(
              "w-full py-4 rounded-2xl font-black text-[15px] shadow-lg transition-all flex items-center justify-center gap-3 mt-4 cursor-pointer",
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed text-white/80"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 active:scale-95",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận tạo mới"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
