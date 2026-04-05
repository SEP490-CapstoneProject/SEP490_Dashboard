export interface Employee {
  employeeId: number;
  userId: number;
  name: string;
  email: string;
  status: "Hoạt động" | "Bị khóa";
  phone?: string;
  createdAt?: string;
  coverImage?: string; 
  avatar: string; 
}

export const allUsers: Employee[] = [
  {
    userId: 1,
    employeeId: 1,
    name: "Trần Minh Hoàng",
    email: "hoang.tm@gmail.com",
    status: "Hoạt động",
    createdAt: "12/04/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y292ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    userId: 2,
    employeeId: 2,
    name: "Lê Thị Ngọc",
    email: "ngoc.le@outlook.com",
    status: "Hoạt động",
    createdAt: "08/04/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ngoc",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y292ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    userId: 3,
    employeeId: 3,
    name: "Phạm Văn Vũ",
    email: "vuvp.dev@gmail.com",
    status: "Bị khóa",
    createdAt: "25/03/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vu",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y292ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    userId: 4,
    employeeId: 4,
    name: "Quách Gia Huy",
    email: "huyqg99@gmail.com",
    status: "Hoạt động",
    createdAt: "15/03/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Huy",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y292ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    userId: 5,
    employeeId: 5,
    name: "Mai Anh Tuyết",
    email: "tuyetmai.art@gmail.com",
    status: "Hoạt động",
    createdAt: "02/03/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tuyet",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y292ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    userId: 6,
    employeeId: 6,
    name: "Nguyễn Văn A",
    email: "admin@system.com",
    status: "Hoạt động",
    createdAt: "01/01/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminA",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y292ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    userId: 7,
    employeeId: 7,
    name: "Lê Văn C",
    email: "levanc.dev@gmail.com",
    status: "Bị khóa",
    createdAt: "10/02/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cee",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y292ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    userId: 8,
    employeeId: 8,
    name: "Dương Hoàng",
    email: "hoangduong@gmail.com",
    status: "Hoạt động",
    createdAt: "12/05/2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HoangDuong",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y292ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
  },
];

/**
 * Hàm lấy thông tin chi tiết User từ ID (dùng cho trang Profile)
 */
export const getUserById = (id: number): Employee | undefined => {
  // Chuẩn hóa ID: Nếu URL truyền USR-8000, ta thêm # thành #USR-8000 để match với data
  return allUsers.find((user) => user.userId === id);
};
