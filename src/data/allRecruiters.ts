export interface Recruiter {
  id: string;
  name: string;
  location: string;
  email: string;
  taxId: string; // Mã số thuế
  industry: string; // Lĩnh vực
  description: string;
  status: "Hoạt động" | "Đang chờ duyệt" | "Bị từ chối";
  logoSeed: string;
  bannerUrl: string;
}

export const allRecruiters: Recruiter[] = [
  {
    id: "RE001",
    name: "VNG Corporation",
    location: "Quận 7, TP. HCM",
    email: "hr@vng.com.vn",
    taxId: "0102030405",
    industry: "Công nghệ phần mềm",
    description: "Công ty công nghệ hàng đầu Việt Nam, sở hữu hệ sinh thái Zalo, Zing và các tựa game nổi tiếng.",
    status: "Hoạt động",
    logoSeed: "VNG",
    bannerUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
  },
  {
    id: "RE002",
    name: "Shopee Vietnam",
    location: "Ba Đình, Hà Nội",
    email: "talent@shopee.vn",
    taxId: "0314460217",
    industry: "Thương mại điện tử",
    description: "Nền tảng thương mại điện tử hàng đầu tại Đông Nam Á và Đài Loan.",
    status: "Đang chờ duyệt",
    logoSeed: "Shopee",
    bannerUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200",
  },
  {
    id: "RE003",
    name: "Techcombank",
    location: "Quận 1, TP. HCM",
    email: "recruitment@tcb.com.vn",
    taxId: "0100234035",
    industry: "Ngân hàng & Tài chính",
    description: "Một trong những ngân hàng thương mại cổ phần lớn nhất Việt Nam.",
    status: "Bị từ chối",
    logoSeed: "Techcom",
    bannerUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200",
  },
  {
    id: "RE004",
    name: "Giao Hàng Nhanh",
    location: "Tân Bình, TP. HCM",
    email: "jobs@ghn.vn",
    taxId: "0311894411",
    industry: "Vận chuyển & Logistics",
    description: "Đơn vị vận chuyển hàng đầu dành cho các đối tác thương mại điện tử.",
    status: "Hoạt động",
    logoSeed: "GHN",
    bannerUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200",
  },
  {
    id: "RE005",
    name: "FPT Software",
    location: "Thạch Thất, Hà Nội",
    email: "hr@fsoft.com.vn",
    taxId: "0102100740",
    industry: "Công nghệ thông tin",
    description: "Thành viên của tập đoàn FPT, chuyên cung cấp các dịch vụ xuất khẩu phần mềm.",
    status: "Hoạt động",
    logoSeed: "FPT",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
  }
];

/**
 * Hàm lấy chi tiết Nhà tuyển dụng theo ID (dùng cho trang Recruiter Profile)
 */
export const getRecruiterById = (id: string): Recruiter | undefined => {
  const formattedId = id.startsWith("#") ? id : `#${id}`;
  return allRecruiters.find((rec) => rec.id === formattedId);
};