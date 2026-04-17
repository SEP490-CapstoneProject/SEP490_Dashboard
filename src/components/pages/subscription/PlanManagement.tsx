import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Settings2,
  Loader2,
  Save,
  Type,
} from "lucide-react";
import { Feature, Plan } from "@/types/subscription";
import { useAppSelector } from "@/store/hook";
import { notify } from "@/lib/toast";
import { CustomSelect } from "@/components/common/CustomSelect";

const typeOptions = [
  { label: "Số lượng", value: "Number" },
  { label: "Bật/Tắt", value: "Boolean" },
  { label: "Văn bản", value: "Text" },
];

const billingOptions = [
  { label: "Gói tháng", value: "1" },
  { label: "Gói năm", value: "2" },
];

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Quản lý riêng Billing Cycle cho CustomSelect
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<string>("1");

  const { accessToken } = useAppSelector((state) => state.auth);
  const planFormRef = useRef<HTMLDivElement>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://subscription-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/Plans",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      console.log("Fetched plans:", data);
      setPlans(data);
    } catch (error) {
      console.error("Lỗi fetch plans:", error);
      notify.error("Không thể tải danh sách gói dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async (planId: number) => {
    try {
      const response = await fetch(
        `https://subscription-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/admin/plans/${planId}/features`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
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

  const updateLocalFeature = (id: number, data: Partial<Feature>) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...data } : f))
    );
  };

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
      };

      const updatePlanPromise = fetch(
        `https://subscription-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/admin/plans/${editingPlan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(planPayload),
        }
      );

      const updateFeaturesPromises = features.map((f) => {
        const typeMap: Record<string, number> = { Number: 0, Boolean: 1, Text: 2 };
        return fetch(
          `https://subscription-service.grayforest-11aba44e.southeastasia.azurecontainerapps.io/api/admin/plans/${editingPlan.id}/features/${f.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              featureName: f.featureName,
              value: String(f.value),
              type: typeMap[f.type] ?? 0,
            }),
          }
        );
      });

      await Promise.all([updatePlanPromise, ...updateFeaturesPromises]);

      notify.success("Cập nhật hệ thống thành công!");
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      notify.error("Lỗi khi đồng bộ dữ liệu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFeature = async (featureId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tính năng này?")) return;
    setFeatures((prev) => prev.filter((f) => f.id !== featureId));
  };

  return (
    <div className="p-8 bg-[#f7eccd] min-h-screen font-sans text-slate-900">
      <div className="max-w-full mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-800">
              Gói đăng kí
            </h1>
            <p className="text-slate-500 font-medium ">
              Quản trị định mức dịch vụ và tính năng SkillSnap
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPlan({ features: [] });
              setSelectedBillingCycle("1");
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
              Đang tải dữ liệu...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    {plan.billingCycle === "Monthly" ? "Gói tháng" : "Gói năm"}
                  </div>
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setSelectedBillingCycle(String(plan.billingCycle));
                      setIsModalOpen(true);
                      fetchFeatures(plan.id);
                    }}
                    className="p-2 text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
                <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                <p className="text-3xl font-black text-blue-600 mb-4">
                  {plan.price.toLocaleString()} VND
                </p>
                <div className="pt-6 border-t border-slate-50 space-y-2">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Tính năng nổi bật
                  </span>
                  {plan.features?.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs font-bold text-slate-600 pt-2"
                    >
                      <Check size={14} className="text-green-500" />{" "}
                      {f.featureName}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Cấu hình chi phí & quyền hạn người dùng
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {/* Thông tin cơ bản */}
              <div
                ref={planFormRef}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100 shadow-inner"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1">
                    Tên gói dịch vụ
                  </label>
                  <input
                    defaultValue={editingPlan?.name}
                    className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
                    placeholder="VD: Chuyên nghiệp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1">
                    Giá tiền (VND)
                  </label>
                  <input
                    defaultValue={editingPlan?.price}
                    type="number"
                    min={0}
                    className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1">
                    Chu kỳ thanh toán
                  </label>
                  <CustomSelect
                    options={billingOptions}
                    value={selectedBillingCycle}
                    onChange={(val) => setSelectedBillingCycle(val)}
                    className="w-full lg:w-full"
                  />
                </div>
              </div>

              {/* Danh sách tính năng */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Settings2 size={16} className="text-blue-600" /> 
                    Danh sách tính năng ({features.length})
                  </h3>
                  <button className="text-blue-600 text-[11px] font-black bg-blue-50 px-5 py-2 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 cursor-pointer">
                    + Thêm tính năng
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((f) => (
                    <div
                      key={f.id}
                      className="flex flex-col p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-blue-200 transition-all group shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <textarea
                            className="bg-transparent border-none p-0 text-sm font-black text-slate-800 outline-none w-full focus:ring-0 resize-none leading-tight"
                            defaultValue={f.featureName}
                            rows={1}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = "auto";
                              target.style.height = `${target.scrollHeight}px`;
                            }}
                            onBlur={(e) =>
                              updateLocalFeature(f.id, {
                                featureName: e.target.value,
                              })
                            }
                          />
                          <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mt-1">
                            Mã: {f.featureKey}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteFeature(f.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        {/* Thay đổi Loại dữ liệu */}
                        <div className="flex items-center gap-2">
                          <Type size={14} className="text-slate-400" />
                          <CustomSelect
                            options={typeOptions}
                            value={f.type}
                            onChange={(val) =>
                              updateLocalFeature(f.id, {
                                type: val as any,
                                value: val === "Boolean" ? "false" : "0",
                              })
                            }
                            className="w-32 lg:w-32"
                          />
                        </div>

                        {/* Input giá trị */}
                        <div className="flex items-center">
                          {f.type === "Boolean" ? (
                            <button
                              onClick={() =>
                                updateLocalFeature(f.id, {
                                  value: f.value === "true" ? "false" : "true",
                                })
                              }
                              className={`w-12 h-6 rounded-full relative p-1 transition-all duration-500 cursor-pointer ${
                                f.value === "true"
                                  ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                                  : "bg-slate-300 shadow-inner"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-md ${
                                  f.value === "true"
                                    ? "translate-x-6 scale-110"
                                    : "translate-x-0"
                                }`}
                              ></div>
                            </button>
                          ) : f.type === "Number" ? (
                            <div className="relative">
                              <input
                                type="number"
                                className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-600 text-center outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={f.value}
                                onChange={(e) =>
                                  updateLocalFeature(f.id, { value: e.target.value })
                                }
                              />
                              {f.value === "-1" && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-blue-500 bg-white px-1 border border-blue-50 rounded">
                                  VÔ HẠN
                                </span>
                              )}
                            </div>
                          ) : (
                            <input
                              type="text"
                              className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                              value={f.value}
                              onChange={(e) =>
                                updateLocalFeature(f.id, { value: e.target.value })
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

            {/* Modal Footer */}
            <div className="p-10 border-t border-slate-50 flex justify-end gap-5 bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-12 py-4 text-sm font-black bg-blue-600 text-white rounded-2xl hover:bg-blue-900 shadow-2xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSaving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;