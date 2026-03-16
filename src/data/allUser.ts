export interface User {
  id: string;
  name: string;
  email: string;
  status: "Hoạt động" | "Bị khóa";
  joinedDate: string;
  avatarSeed: string;
}

export const allUsers: User[] = [
  {
    id: "USR-8000",
    name: "Trần Minh Hoàng",
    email: "hoang.tm@gmail.com",
    status: "Hoạt động",
    joinedDate: "12/04/2024",
    avatarSeed: "Hoang",
  },
  {
    id: "USR-7999",
    name: "Lê Thị Ngọc",
    email: "ngoc.le@outlook.com",
    status: "Hoạt động",
    joinedDate: "08/04/2024",
    avatarSeed: "Ngoc",
  },
  {
    id: "USR-7998",
    name: "Phạm Văn Vũ",
    email: "vuvp.dev@gmail.com",
    status: "Bị khóa",
    joinedDate: "25/03/2024",
    avatarSeed: "Vu",
  },
  {
    id: "USR-7997",
    name: "Quách Gia Huy",
    email: "huyqg99@gmail.com",
    status: "Hoạt động",
    joinedDate: "15/03/2024",
    avatarSeed: "Huy",
  },
  {
    id: "USR-7996",
    name: "Mai Anh Tuyết",
    email: "tuyetmai.art@gmail.com",
    status: "Hoạt động",
    joinedDate: "02/03/2024",
    avatarSeed: "Tuyet",
  },
  {
    id: "USR-7995",
    name: "Nguyễn Văn A",
    email: "admin@system.com",
    status: "Hoạt động",
    joinedDate: "01/01/2024",
    avatarSeed: "AdminA",
  },
  {
    id: "USR-7994",
    name: "Lê Văn C",
    email: "levanc.dev@gmail.com",
    status: "Bị khóa",
    joinedDate: "10/02/2024",
    avatarSeed: "Cee",
  },
  {
    id: "USR-7993",
    name: "Dương Hoàng",
    email: "hoangduong@gmail.com",
    status: "Hoạt động",
    joinedDate: "12/05/2024",
    avatarSeed: "HoangDuong",
  }
];

/**
 * Hàm lấy thông tin chi tiết User từ ID (dùng cho trang Profile)
 */
export const getUserById = (id: string): User | undefined => {
  // Chuẩn hóa ID: Nếu URL truyền USR-8000, ta thêm # thành #USR-8000 để match với data
  const formattedId = id.startsWith("#") ? id : `#${id}`;
  return allUsers.find((user) => user.id === formattedId);
};