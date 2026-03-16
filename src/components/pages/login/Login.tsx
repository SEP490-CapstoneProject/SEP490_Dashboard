import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Globe, User, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import LoginPlaceholder from "@/assets/login-page-image-placeholder.png";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
type AuthMode = "login" | "register";
export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header giữ nguyên ... */}
      <header className="w-full px-6 py-2 flex justify-between items-center bg-white  ">
        <div className="flex items-center gap-2">
          <img
            src="/product-logo.png"
            alt="SkillSnap Logo"
            className="h-16 w-auto"
          />
        </div>
      </header>
      <main className="grow flex items-center justify-center p-4">
        <Card className="w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          {/* Ảnh bên trái giữ nguyên ... */}
          <div className="hidden lg:flex lg:w-1/2 bg-[#F0DBBA] relative items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 pattern-grid-lg text-slate-500"></div>
            <img
              src={LoginPlaceholder}
              alt="Illustration"
              className="z-10 w-full h-auto object-contain transition-all duration-500 animate-in fade-in zoom-in duration-700"
            />
          </div>
          <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-white flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto">
              {/* Tabs Switcher */}
              <div className="flex w-full mb-8 border-b border-slate-200">
                <button
                  onClick={() => setMode("login")}
                  className={cn(
                    "flex-1 pb-3 cursor-pointer text-sm transition-all",
                    mode === "login"
                      ? "text-[#0288D1] border-b-2 border-[#0288D1] font-bold"
                      : "text-slate-500",
                  )}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={cn(
                    "flex-1 pb-3 cursor-pointer text-sm transition-all",
                    mode !== "login"
                      ? "text-[#0288D1] border-b-2 border-[#0288D1] font-bold"
                      : "text-slate-500",
                  )}
                >
                  Đăng ký
                </button>
              </div>

              {/* Tiêu đề động */}
              <div className="mb-1">
                <h1 className="text-2xl font-bold">
                  {mode === "login" && "Chào mừng trở lại!"}
                  {mode === "register" && "Tạo tài khoản mới"}
                </h1>
              </div>

              {/* Render Component tương ứng */}
              <div className="min-h-100 flex flex-col justify-start">
                {mode === "login" && <LoginForm />}
                {mode === "register" && (
                  <RegisterForm onSwitch={() => setMode("login")} />
                )}
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
