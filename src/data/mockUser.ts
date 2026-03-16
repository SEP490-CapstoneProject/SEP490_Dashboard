export interface MockUser {
  email: string;
  password: string;
  role: string;
}

export const mockLoginAccounts: MockUser[] = [
  // Admin
  {
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
  },
  
  // Users / Talents (Ứng viên)
  {
    email: 'user@gmail.com',
    password: 'user123',
    role: 'user',
  },
  {
    email: 'nguyenvanan@gmail.com',
    password: '123456',
    role: 'user',
  },
  {
    email: 'tranthib@gmail.com',
    password: '123456',
    role: 'user',
  },
  {
    email: 'lehoangminh@gmail.com',
    password: '123456',
    role: 'user',
  },
  {
    email: 'phamdieu@gmail.com',
    password: '123456',
    role: 'user',
  },
  {
    email: 'dangvanem@gmail.com',
    password: '123456',
    role: 'user',
  },
  {
    email: 'vohuong@gmail.com',
    password: '123456',
    role: 'user',
  },
  {
    email: 'hoangkhoa@gmail.com',
    password: '123456',
    role: 'user',
  },

  // Companies (Công ty) - Role là recruiter
  {
    email: 'google@company.com',
    password: '123456',
    role: 'recruiter',
  },
  {
    email: 'fpt@company.com',
    password: '123456',
    role: 'recruiter',
  },
  {
    email: 'microsoft@company.com',
    password: '123456',
    role: 'recruiter',
  },
  {
    email: 'vng@company.com',
    password: '123456',
    role: 'recruiter',
  },
  {
    email: 'aws@company.com',
    password: '123456',
    role: 'recruiter',
  },
  {
    email: 'moderator@gmail.com',
    password: 'moderator123',
    role: 'recruiter',
  },

  // Recruiters (Nhà tuyển dụng)
  {
    email: 'recruiter@gmail.com',
    password: 'recruiter123',
    role: 'recruiter',
  },
  {
    email: 'phamcuong@recruiter.com',
    password: '123456',
    role: 'recruiter',
  },
  {
    email: 'thuha@recruiter.com',
    password: '123456',
    role: 'recruiter',
  },
  {
    email: 'minhtuan@recruiter.com',
    password: '123456',
    role: 'recruiter',
  },
];
