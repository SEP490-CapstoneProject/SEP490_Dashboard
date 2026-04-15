import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/common/DashboardLayout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { lazy, Suspense } from "react";
// Thay đổi cách import các trang:
const LoginPage = lazy(() => import("./components/pages/login/Login"));
const UserManagement = lazy(
  () => import("./components/pages/user/UserManagement"),
);
const RecruiterManagement = lazy(
  () => import("./components/pages/recruiter/RecruiterManagement"),
);
const CommunityPostManagement = lazy(
  () => import("./components/pages/community/CommunityPostManagement"),
);
const JobPostManagement = lazy(
  () => import("./components/pages/recruiter/JobPostManagement"),
);
const PortfolioManagement = lazy(
  () => import("./components/pages/user/PortfolioManagement"),
);
const UserProfileManagement = lazy(
  () => import("./components/pages/user/UserProfileManagement"),
);
const RecruiterProfileManagement = lazy(
  () => import("./components/pages/recruiter/RecruiterProfileManagement"),
);
const JobPostDetails = lazy(
  () => import("./components/pages/recruiter/JobPostDetail"),
);
const CommunityPostDetail = lazy(
  () => import("./components/pages/community/CommunityPostDetail"),
);

import { ToastContainer } from "react-toastify";

import LoadingWrapper from "./components/loading/LoadingWrapper";
import PaymentFailedPage from "./components/pages/subscription/PaymentFailedPage";
import { StatisticPage } from "./components/pages/analytic/StatisticPage";
// import Members từ một file page khác bạn sẽ tạo

function App() {
  return (
    <BrowserRouter>
      {/* Sử dụng Suspense bao bọc toàn bộ Routes. 
        Khi chuyển trang, LoadingWrapper sẽ hiển thị trong lúc tải file JS của trang đó.
      */}
      <Suspense fallback={<LoadingWrapper />}>
        <Routes>
          {/* Route trang Login tách biệt hoàn toàn */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />{" "}
          {/* Mặc định vào login nếu muốn */}
          {/* Nhóm các route Dashboard sử dụng Layout chung - Chỉ admin mới vào được */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole={3}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Khi vào /dashboard, sẽ tự động render PortfolioPage thông qua Outlet */}
            <Route index element={<UserManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/:id" element={<UserProfileManagement />} />
            <Route path="recruiters" element={<RecruiterManagement />} />
            <Route path="payment" element={<PaymentFailedPage />} />
            <Route
              path="recruiters/:id"
              element={<RecruiterProfileManagement />}
            />
            <Route
              path="community-posts"
              element={<CommunityPostManagement />}
            />
            <Route
              path="community-posts/:id"
              element={<CommunityPostDetail />}
            />
            <Route path="job-posts" element={<JobPostManagement />} />
            <Route path="job-posts/:id" element={<JobPostDetails />} />
            <Route path="statistics" element={<StatisticPage />} />
            <Route path="portfolios" element={<PortfolioManagement />} />
          </Route>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          style={{ top: "100px" }}
          theme="light"
        />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
