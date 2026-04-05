import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/common/DashboardLayout";
import LoginPage from "./components/pages/login/Login";
import UserManagement from "./components/pages/user/UserManagement";
import RecruiterManagement from "./components/pages/recruiter/CompanyManagement";
import CommunityPostManagement from "./components/pages/community/CommunityPostManagement";
import JobPostManagement from "./components/pages/recruiter/JobPostManagement";
import PortfolioManagement from "./components/pages/user/PortfolioManagement";
import UserProfileManagement from "./components/pages/user/UserProfileManagement";
import RecruiterProfileManagement from "./components/pages/recruiter/CompanyProfileManagement";
import CompanyManagement from "./components/pages/recruiter/CompanyManagement";
import CompanyProfileManagement from "./components/pages/recruiter/CompanyProfileManagement";
// import Members từ một file page khác bạn sẽ tạo

function App() {
  return (
    <Router>
      <Routes>
        {/* Route trang Login tách biệt hoàn toàn */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />{" "}
        {/* Mặc định vào login nếu muốn */}
        {/* Nhóm các route Dashboard sử dụng Layout chung */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Khi vào /dashboard, sẽ tự động render PortfolioPage thông qua Outlet */}
          <Route index element={<UserManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserProfileManagement />} />
          <Route path="companies" element={<CompanyManagement />} />
          <Route path="companies/:id" element={<CompanyProfileManagement />} />
          <Route path="community-posts" element={<CommunityPostManagement />} />
          <Route path="job-posts" element={<JobPostManagement />} />
          <Route path="portfolios" element={<PortfolioManagement />} />
        </Route>
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
