import { Mail, Lock, User, Eye, EyeOff, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const RegisterForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-4 animate-in slide-in-from-right-4 duration-500">
      {/* <div className="space-y-1.5">
        <Label htmlFor="username">Tên hiển thị</Label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            id="username"
            placeholder="Nhập tên của bạn"
            className="pl-10 h-11 border-none bg-slate-100 focus-visible:ring-1 focus-visible:ring-[#0288D1]"
          />
        </div>
      </div> */}

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
            className="pl-10 h-11 border-none bg-slate-100 focus-visible:ring-1 focus-visible:ring-[#0288D1]"
          />
        </div>
      </div>

      {/* Grid mật khẩu */}
      {/* <div className="grid grid-cols-2 gap-3"> */}
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
              className="pl-10 pr-10 h-11 border-none bg-slate-100 focus-visible:ring-1 focus-visible:ring-[#0288D1]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Xác nhận</Label>
          <div className="relative">
            <RotateCcw
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 h-11 border-none bg-slate-100 focus-visible:ring-1 focus-visible:ring-[#0288D1]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      {/* </div> */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSwitch}
          className="text-sm font-medium text-[#0288D1] hover:underline"
        >
          Đăng ký cho Nhà tuyển dụng?
        </button>
      </div>

      <Button className="w-full h-11 font-bold cursor-pointer text-white bg-[#0288D1] hover:bg-[#0277bd] border-none shadow-none">
        Đăng ký ứng viên
      </Button>
    </form>
  );
};
