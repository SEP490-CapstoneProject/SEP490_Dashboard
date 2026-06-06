import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Settings2,
  Loader2,
  Save,
  Type,
  ChevronDown,
  User,
  Building2,
} from "lucide-react";
import { Feature, Plan } from "@/types/subscription";
import { useAppSelector } from "@/store/hook";
import { notify } from "@/lib/toast";

const typeOptions = [
  { label: "Số lượng", value: "Number" },
  { label: "Bật/Tắt", value: "Boolean" },
  { label: "Văn bản", value: "Text" },
];

const billingOptions = [
  { label: "Gói tháng", value: "1" },
  { label: "Gói năm", value: "2" },
];

const roleOptions = [
  { label: "Ứng viên", value: "1" },
  { label: "Doanh nghiệp", value: "2" },
];

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const BASE_URL = "https://subscription-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api";
  
  // Quản lý Billing Cycle & Allowed Role bằng State để đồng bộ với Select
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<string>("1");
  const [selectedAllowedRole, setSelectedAllowedRole] = useState<string>("1");

  const { accessToken } = useAppSelector((state) => state.auth);
  const planFormRef = useRef<HTMLDivElement>(null);

  // 1. Lấy danh sách các gói
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/Plans`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Lỗi fetch plans:", error);
      notify.error("Không thể tải danh sách gói");
    } finally {
      loading && setLoading(false);
    }
  };

  // 2. Lấy danh sách tính năng của một gói
  const fetchFeatures = async (planId: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/plans/${planId}/features`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await response.json();
      setFeatures(data);
    } catch (error) {
      console.error("Lỗi fetch features:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // 3. Cập nhật dữ liệu feature tại local state
  const updateLocalFeature = (id: number, data: Partial<Feature>) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...data } : f)),
    );
  };

  // 4. Thêm một dòng tính năng mới (chưa có ID)
  const handleAddNewFeature = () => {
    const newFeature: Feature = {
      id: 0, // ID 0 đánh dấu là cần POST
      planId: editingPlan?.id || 0,
      featureKey: "",
      featureName: "",
      value: "0",
      type: "Number",
      isActive: true,
    };
    setFeatures((prev) => [...prev, newFeature]);
  };

  // 5. Xử lý Lưu toàn bộ (Plan + Features)
  const handleSaveAll = async () => {
    if (!editingPlan?.id) return;
    setIsSaving(true);

    try {
      const planInputs = planFormRef.current?.querySelectorAll("input");
      const planPayload = {
        name: (planInputs?.[0] as HTMLInputElement).value,
        price: parseFloat((planInputs?.[1] as HTMLInputElement).value),
        description: editingPlan.description || "",
        billingCycle: parseInt(selectedBillingCycle),
        allowedRole: selectedAllowedRole, // Lưu thông tin loại role dưới dạng string
      };

      // Promise cập nhật thông tin chung của Plan
      const updatePlanPromise = fetch(
        `${BASE_URL}/admin/plans/${editingPlan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(planPayload),
        },
      );

      // Promises cho danh sách tính năng (Phân loại POST/PUT)
      const typeMap: Record<string, number> = {
        Number: 0,
        Boolean: 1,
        Text: 2,
      };

      const featurePromises = features.map((f) => {
        const isNew = f.id === 0;
        const url = isNew
          ? `${BASE_URL}/admin/plans/${editingPlan.id}/features`
          : `${BASE_URL}/admin/plans/${editingPlan.id}/features/${f.id}`;

        const payload: any = {
          featureName: f.featureName,
          value: String(f.value),
          type: typeMap[f.type] ?? 0,
        };

        if (isNew) payload.featureKey = f.featureKey; // POST cần thêm key

        return fetch(url, {
          method: isNew ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      });

      await Promise.all([updatePlanPromise, ...featurePromises]);

      notify.success("Hệ thống đã được cập nhật!");
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      notify.error("Lỗi khi lưu dữ liệu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFeature = async (planId: number, featureId: number) => {
    if (featureId === 0) {
      setFeatures((prev) => prev.filter((f) => f.id !== featureId));
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa tính năng này?")) return;
    try {
      const res = await fetch(
        `${BASE_URL}/admin/plans/${planId}/features/${featureId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (res.ok) {
        setFeatures((prev) => prev.filter((f) => f.id !== featureId));
        notify.success("Đã xóa tính năng");
      }
    } catch (error) {
      notify.error("Lỗi khi xóa");
    }
  };

  // Hàm helper để render danh sách gói theo từng Role
  const renderPlanGrid = (filteredPlans: Plan[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredPlans.map((plan) => (
        <div
          key={plan.id}
          className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">
              {plan.billingCycle === "Monthly" ? "Gói tháng" : "Gói năm"}
            </div>
            <button
              onClick={() => {
                setEditingPlan(plan);
                setSelectedBillingCycle(String(plan.billingCycle));
                setSelectedAllowedRole(String(plan.allowedRole)); // Gán giá trị role hiện tại lên select mẫu
                setIsModalOpen(true);
                fetchFeatures(plan.id);
              }}
              className="p-2 text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Edit2 size={18} />
            </button>
          </div>
          <h3 className="text-2xl font-black mb-1 leading-tight">
            {plan.name}
          </h3>
          <p className="text-slate-500 text-xs mb-2 ">
            {plan.description || "Chưa có mô tả"}
          </p>
          <p className="text-3xl font-black text-blue-600 mb-4">
            {plan.price.toLocaleString()} VND
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 bg-[#f7eccd] min-h-screen font-sans text-slate-900 overflow-x-hidden">
      <div className="max-w-full mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
            Quản lý gói dịch vụ
          </h1>
          <button
            onClick={() => {
              setEditingPlan({ features: [] });
              setSelectedBillingCycle("1");
              setSelectedAllowedRole("1"); // Reset về mặc định: Ứng viên
              setFeatures([]);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={20} /> Thêm gói mới
          </button>
        </div>

        {loading && !isModalOpen ? (
          <div className="flex flex-col items-center justify-center h-72 text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span className="font-bold text-xs uppercase tracking-widest">
              Đang tải ...
            </span>
          </div>
        ) : (
          <div className="space-y-12">
            {/* HÀNG 1: DÀNH CHO ỨNG VIÊN (ROLE = "1") */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider px-2">
                <User size={18} className="text-blue-600" />
                Gói dịch vụ dành cho Ứng viên
              </div>
              {renderPlanGrid(plans.filter((p) => String(p.allowedRole) === "1"))}
              {plans.filter((p) => String(p.allowedRole) === "1").length === 0 && (
                <p className="text-xs text-slate-500  pl-2">Chưa có cấu hình gói dịch vụ ứng viên.</p>
              )}
            </div>

            {/* HÀNG 2: DÀNH CHO DOANH NGHIỆP (ROLE = "2") */}
            {/* <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider px-2">
                <Building2 size={18} className="text-emerald-600" />
                Gói dịch vụ dành cho Doanh nghiệp
              </div>
              {renderPlanGrid(plans.filter((p) => String(p.allowedRole) === "2"))}
              {plans.filter((p) => String(p.allowedRole) === "2").length === 0 && (
                <p className="text-xs text-slate-500  pl-2">Chưa có cấu hình gói dịch vụ doanh nghiệp.</p>
              )}
            </div> */}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-blue-600">
                  {editingPlan?.id ? "Cập nhật gói dịch vụ" : "Tạo gói mới"}
                </h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                  Cấu hình chi phí, chu kỳ & phân hệ tài khoản áp dụng
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* PHẦN THÔNG TIN GÓI */}
              <div
                ref={planFormRef}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-blue-50/20 rounded-[2.5rem] border border-blue-50 shadow-inner"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1">
                    Tên gói dịch vụ
                  </label>
                  <input
                    defaultValue={editingPlan?.name}
                    className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1">
                    Giá tiền (VND)
                  </label>
                  <input
                    defaultValue={editingPlan?.price}
                    type="number"
                    className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1">
                    Chu kỳ thanh toán
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBillingCycle}
                      onChange={(e) => setSelectedBillingCycle(e.target.value)}
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      {billingOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* THÊM TRƯỜNG ALLOWED ROLE TẠI ĐÂY */}
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1">
                    Đối tượng áp dụng (Allowed Role)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAllowedRole}
                      onChange={(e) => setSelectedAllowedRole(e.target.value)}
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN DANH SÁCH TÍNH NĂNG */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Settings2 size={16} className="text-blue-600" /> Tính năng
                    đính kèm ({features.length})
                  </h3>
                  <button
                    onClick={handleAddNewFeature}
                    className="text-blue-600 text-[11px] font-black bg-blue-50 px-5 py-2 rounded-xl hover:bg-blue-100 border border-blue-100 cursor-pointer"
                  >
                    + Thêm tính năng mới
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {features.map((f) => (
                    <div
                      key={f.id}
                      className="flex flex-col p-6 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-blue-200 transition-all group shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 flex flex-col">
                          <textarea
                            className="bg-transparent border-none p-0 text-sm font-black text-slate-800 outline-none w-full focus:ring-0 resize-none leading-tight"
                            placeholder="Tên tính năng..."
                            value={f.featureName}
                            rows={1}
                            onInput={(e) => {
                              (e.target as any).style.height = "auto";
                              (e.target as any).style.height =
                                (e.target as any).scrollHeight + "px";
                            }}
                            onChange={(e) =>
                              updateLocalFeature(f.id, {
                                featureName: e.target.value,
                              })
                            }
                          />
                        </div>
                        {f.id === 0 ? (
                          <input
                            className="bg-white border border-blue-100 rounded-lg px-2 py-1 text-[9px] text-blue-600 font-black uppercase mt-2 outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="NHẬP MÃ TÍNH NĂNG (KEY)"
                            value={f.featureKey}
                            onChange={(e) =>
                              updateLocalFeature(f.id, {
                                featureKey: e.target.value.toUpperCase(),
                              })
                            }
                          />
                        ) : (
                          <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mt-1">
                            Mã: {f.featureKey}
                          </p>
                        )}
                        <button
                          onClick={() => handleDeleteFeature(f.planId, f.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                        <div className="flex items-center gap-2">
                          <Type size={14} className="text-slate-400" />
                          <select
                            value={f.type}
                            onChange={(e) =>
                              updateLocalFeature(f.id, {
                                type: e.target.value as any,
                                value:
                                  e.target.value === "Boolean" ? "false" : "0",
                              })
                            }
                            className="bg-white border border-slate-100 text-[10px] font-black uppercase tracking-tighter text-slate-500 rounded-xl py-1.5 px-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                          >
                            {typeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center">
                          {f.type === "Boolean" ? (
                            <button
                              onClick={() =>
                                updateLocalFeature(f.id, {
                                  value: f.value === "true" ? "false" : "true",
                                })
                              }
                              className={`w-12 h-6 rounded-full relative p-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${f.value === "true" ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" : "bg-slate-300 shadow-inner"}`}
                            >
                              <div
                                className={`w-4 h-4 bg-white rounded-full shadow-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${f.value === "true" ? "translate-x-6 scale-110" : "translate-x-0"}`}
                              ></div>
                            </button>
                          ) : f.type === "Number" ? (
                            <div className="relative">
                              <input
                                type="number"
                                className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-600 text-center outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={f.value}
                                onChange={(e) =>
                                  updateLocalFeature(f.id, {
                                    value: e.target.value,
                                  })
                                }
                              />
                              {f.value === "-1" && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-blue-500 bg-white px-1 border border-blue-50 rounded  shadow-sm">
                                  VÔ HẠN
                                </span>
                              )}
                            </div>
                          ) : (
                            <input
                              type="text"
                              className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                              placeholder="Giá trị văn bản..."
                              value={f.value}
                              onChange={(e) =>
                                updateLocalFeature(f.id, {
                                  value: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-50 flex justify-end gap-5 bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all cursor-pointer "
              >
                Hủy thay đổi
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-12 py-4 text-sm font-black bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-2xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "ĐANG ĐỒNG BỘ..." : "LƯU THAY ĐỔI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;