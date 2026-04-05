export interface Company {
  userId: number;
  companyId: number;
  companyName: string;
  activityField: string;
  coverImage: string;
  avatar: string;
  taxIdentification: string;
  address: string;
  description: string;
  email: string;
  status: "Hoạt động" | "Đang chờ duyệt" | "Bị từ chối";
}

export const allCompanies: Company[] = [
  {
    userId: 1,
    companyId: 1,
    companyName: "VNG Corporation",
    activityField: "Công nghệ phần mềm",
    coverImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
    avatar:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
    taxIdentification: "0102030405",
    address: "Quận 7, TP. HCM",
    description:
      "Công ty công nghệ hàng đầu Việt Nam, sở hữu hệ sinh thái Zalo, Zing và các tựa game nổi tiếng.",
    email: "hr@vng.com.vn",
    status: "Hoạt động",
  },
  {
    userId: 2,
    companyId: 2,
    companyName: "FPT Software",
    activityField: "Công nghệ phần mềm",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    avatar:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    taxIdentification: "0607080901",
    address: "Hà Nội",
    description:
      "FPT Software là công ty phần mềm lớn nhất Việt Nam, chuyên cung cấp dịch vụ gia công phần mềm và giải pháp công nghệ.",
    email: "hr@fsoft.com.vn",
    status: "Đang chờ duyệt",
  },
  {
    userId: 3,

    companyId: 3,
    companyName: "Viettel",
    activityField: "Viễn thông và công nghệ",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    avatar:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    taxIdentification: "1122334455",
    address: "Hà Nội",
    description:
      "Viettel là tập đoàn viễn thông lớn nhất Việt Nam, cung cấp dịch vụ di động, internet và các giải pháp công nghệ thông tin.",
    email: "hr@viettel.com.vn",
    status: "Hoạt động",
  },
  {
    userId: 4,
    companyId: 4,
    companyName: "Vingroup",
    activityField: "Đa ngành",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    avatar:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    taxIdentification: "9988776655",
    address: "Hà Nội",
    description:
      "Vingroup là tập đoàn đa ngành lớn nhất Việt Nam, hoạt động trong các lĩnh vực bất động sản, bán lẻ, công nghệ và y tế.",
    email: "hr@vingroup.com.vn",
    status: "Hoạt động",
  },
  {
    userId: 5,
    companyId: 5,
    companyName: "Masan Group",
    activityField: "Đa ngành",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    avatar:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    taxIdentification: "5566778899",
    address: "Hà Nội",
    description:
      "Masan Group là tập đoàn đa ngành hoạt động trong các lĩnh vực thực phẩm, đồ uống, khai khoáng và bán lẻ.",
    email: "hr@masan.com.vn",
    status: "Bị từ chối",
  },
  {
    userId: 6,
    companyId: 6,
    companyName: "Techcombank",
    activityField: "Ngân hàng và tài chính",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    avatar:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
    taxIdentification: "6677889900",
    address: "Hà Nội",
    description:
      "Techcombank là một trong những ngân hàng thương mại lớn nhất Việt Nam, cung cấp các dịch vụ tài chính và ngân hàng đa dạng.",
    email: "hr@techc.com.vn",
    status: "Hoạt động",
  },
];
