// File: src/pages/AdminDashboard.tsx
import { useState } from "react";
import RoomManagement from "../components/admin/RoomManagement";
import BookingOverview from "../components/admin/BookingOverview";
import { Building, Calendar, Settings, PieChart } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("rooms");

  const tabs = [
    {
      id: "rooms",
      label: "Phòng họp",
      icon: <Building className="w-4 h-4" />,
      description: "Quản lý danh sách và thông tin phòng",
    },
    {
      id: "bookings",
      label: "Đặt phòng",
      icon: <Calendar className="w-4 h-4" />,
      description: "Xem và quản lý tất cả booking",
    },
    {
      id: "reports",
      label: "Báo cáo",
      icon: <PieChart className="w-4 h-4" />,
      description: "Thống kê và phân tích dữ liệu",
    },
    {
      id: "settings",
      label: "Cấu hình",
      icon: <Settings className="w-4 h-4" />,
      description: "Thiết lập hệ thống",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Bảng điều khiển Quản trị
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Quản lý và giám sát hệ thống phòng họp doanh nghiệp
              </p>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Cập nhật:
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Quản lý hệ thống
                </h2>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-2.5 mb-1 text-sm font-medium rounded-lg transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                      }
                    `}
                  >
                    <span
                      className={`mr-3 ${activeTab === tab.id ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"}`}
                    >
                      {tab.icon}
                    </span>
                    <div className="text-left flex-1">
                      <div className="font-medium">{tab.label}</div>
                      <div
                        className={`text-xs mt-0.5 ${activeTab === tab.id ? "text-violet-600/80 dark:text-violet-400/80" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {tab.description}
                      </div>
                    </div>
                    {activeTab === tab.id && (
                      <div className="ml-2 w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400"></div>
                    )}
                  </button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Thao tác nhanh
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                    Tạo báo cáo mới
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                    Xem nhật ký hệ thống
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              {/* Tab Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {tabs.find((t) => t.id === activeTab)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="hidden sm:inline">Phiên làm việc:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                        {Math.random().toString(36).substr(2, 6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "rooms" && <RoomManagement />}
                {activeTab === "bookings" && <BookingOverview />}
                {activeTab === "reports" && (
                  <div className="py-12">
                    <div className="max-w-md mx-auto text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <PieChart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Tính năng Báo cáo
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Tính năng đang được phát triển. Sẽ sớm ra mắt với các
                        báo cáo chi tiết và thống kê nâng cao.
                      </p>
                      <div className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        Dự kiến ra mắt: Q2/2024
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "settings" && (
                  <div className="py-12">
                    <div className="max-w-md mx-auto text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Settings className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Cấu hình Hệ thống
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Phần cấu hình hệ thống đang được hoàn thiện để cung cấp
                        đầy đủ tính năng quản lý.
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Liên hệ IT Support để được hỗ trợ cấu hình
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Hệ thống hoạt động bình thường
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Phiên bản 2.1.0 • Được cập nhật 2 giờ trước
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
