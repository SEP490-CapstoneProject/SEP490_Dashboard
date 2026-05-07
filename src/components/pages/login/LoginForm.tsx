import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  loginFailure,
  loginSuccess,
  loginStart,
} from "@/store/features/auth/authSlice";
import { notify } from "@/lib/toast";
import { authAPI } from "@/services/auth.api";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // xử lí error và loading
  const { error, loading } = useAppSelector((state) => state.auth);
  useEffect(() => {
    // Khi vừa vào trang Login, nếu thấy loading đang true mà không rõ lý do,
    // ta ép nó về false để người dùng còn nhìn thấy form.
    if (loading) {
      dispatch(loginFailure(""));
    }
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      dispatch(loginFailure("Vui lòng nhập email và mật khẩu!"));
      return;
    }

    // hiện loading "Đang xác thực..."
    dispatch(loginStart());
    console.log("🔄 Bắt đầu login process cho email:", email);

    try {
      const response = await authAPI.login({ email, password });
      console.log("📥 API response:", response);
      // Kiểm tra response hợp lệ
      if (!response) {
        console.error("❌ No response received");
        dispatch(loginFailure("Không nhận được response từ server"));
        return;
      }

      console.log("📊 Response received:", {
        success: response.success,
        hasData: !!response.data,
        hasUser: !!response.data?.user,
      });

      if (response.success && response.data && response.data.user) {
        // lưu user và tokens
        console.log("✅ Login validation passed, saving user data");
        dispatch(
          loginSuccess({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );

        // Role = 1 là talent, 2 là recruiter
        const role = response.data.user.role;
        console.log("👤 User role:", role);

        if (role === 1 || role === 2) {
          notify.error("Bạn không có quyền truy cập vào trang này!");
        }
        if (role === 3 || role === 4 || role === 5) {
          console.log("role: ", role);
          notify.success("Login thành công!");
          navigate("/dashboard/statistics");
          return;
        }
      } else {
        // API trả về success: false hoặc format không đúng
        const errorMsg =
          response.message || "Email hoặc mật khẩu không chính xác!";
        console.warn(
          "⚠️ Login failed - success:",
          response.success,
          "message:",
          errorMsg,
        );
        dispatch(loginFailure(errorMsg));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Email hoặc mật khẩu không chính xác!";
      console.error("❌ Login exception:", errorMessage, err);
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            className="pl-10 h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
      </div>

      {/* password */}
      <div className="space-y-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 h-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* hiển thị error */}
      {error && (
        <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded border border-red-100 animate-shake">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <a
          href="#"
          className="text-sm font-medium text-[#0288D1] hover:underline"
        >
          Quên mật khẩu?
        </a>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 font-bold text-white bg-[#0288D1] hover:bg-[#0277bd] cursor-pointer disabled:opacity-70 transition-all active:scale-[0.98]"
      >
        {loading ? (
          /* Lớp Overlay phủ toàn bộ màn hình */
          <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Container cho Spinner và Text */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
              {/* Vòng tròn Loading Spinner */}
              <div className="relative">
                {/* Vòng tròn nhạt phía dưới */}
                <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
                {/* Vòng xoay chính */}
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        ) : (
          "Đăng nhập"
        )}
      </Button>
    </form>
  );
};
