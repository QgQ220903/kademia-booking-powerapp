import { type ReactNode } from "react"; // Đã thêm 'type' để sửa lỗi ts(1484)
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, isAdmin, loading } = useUser();

  // 1. Xử lý trạng thái đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center p-8">
          <p className="text-lg font-medium">Đang kiểm tra quyền truy cập...</p>
          {/* Bạn có thể thêm Spinner hoặc Loading icon ở đây */}
        </div>
      </div>
    );
  }

  // 2. Kiểm tra điều kiện: Nếu không có user HOẶC không phải admin
  // Chúng ta chuyển hướng về trang chủ (hoặc trang login tùy dự án)
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3. Nếu mọi điều kiện thỏa mãn, hiển thị nội dung bên trong (children)
  return <>{children}</>;
};

export default AdminProtectedRoute;
