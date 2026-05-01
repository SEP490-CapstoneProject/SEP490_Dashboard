import React, { useState, useEffect } from "react";
import { X, Camera, Image as ImageIcon, Loader2, User, Phone as PhoneIcon, Tag } from "lucide-react";
import { useAppSelector } from "@/store/hook";
import { notify } from "@/lib/toast";
import { Employee } from "@/types/user";

interface UpdateUserModalProps {
  isOpen: boolean;
  userProfile: Employee;
  onClose: () => void;
  onSuccess?: () => void;
}

const UpdateUserModal = ({ isOpen, userProfile, onClose, onSuccess }: UpdateUserModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen && userProfile) {
      setName(userProfile.name || "");
      setPhone(userProfile.phone || "");
      setAvatarPreview(userProfile.avatar || "");
      setCoverPreview(userProfile.coverImage || "");
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatar(file);
          setAvatarPreview(reader.result as string);
        } else {
          setCoverImage(file);
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("Name", name);
      formData.append("Phone", phone);
      if (avatar) formData.append("Avatar", avatar);
      if (coverImage) formData.append("CoverImage", coverImage);

      const response = await fetch(`https://userprofile-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api/Employee/${userProfile.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (response.ok) {
        notify.success("Cập nhật thông tin thành công!");
        onSuccess?.();
        onClose();
      } else {
        const errorData = await response.json();
        notify.error(errorData.message || "Cập nhật thất bại");
      }
    } catch (err) {
      notify.error("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-8 pb-4 bg-white z-20">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Chỉnh sửa hồ sơ</h2>
            <p className="text-sm text-slate-400 font-medium">Cập nhật thông tin cá nhân của bạn</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
          
          {/* Cover Image Section */}
          <div className="relative h-40 bg-slate-100 rounded-[2rem] overflow-hidden group mb-16 border-4 border-slate-50">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
            )}
            
            <label className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
              <div className="bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold text-slate-700">
                <Camera size={16} /> Thay đổi ảnh bìa
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
            </label>

            {/* Avatar Section - Trùng lên ảnh bìa */}
            <div className="absolute -bottom-2 left-6">
              <div className="relative group/avatar">
                <div className="w-28 h-28 rounded-[2rem] border-8 border-white bg-slate-100 shadow-xl shadow-slate-200 overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-blue-50">
                      <User size={40} className="text-blue-200" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer rounded-[2rem] flex items-center justify-center">
                  <Camera className="text-white" size={24} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                </label>
              </div>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-6 pb-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all"
                  placeholder="Nhập tên của bạn..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
              <div className="relative group">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all"
                  placeholder="09xx xxx xxx"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-8 pt-4 bg-slate-50/50 border-t border-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserModal;