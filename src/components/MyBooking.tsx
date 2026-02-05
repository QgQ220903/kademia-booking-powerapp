import React, { useState, useEffect } from "react";
import { BookingsService } from "../generated/services/BookingsService";
import { useUser } from "../contexts/UserContext";
import {
  Calendar,
  Building,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  CalendarDays,
  User,
} from "lucide-react";

const MyBookings: React.FC = () => {
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();

  const formatDateTime = (utcString: string) => {
    if (!utcString) return { date: "", time: "", fullDate: "" };
    const date = new Date(utcString);
    return {
      date: date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      fullDate: date,
      dayName: date.toLocaleDateString("vi-VN", { weekday: "short" }),
      dayFullName: date.toLocaleDateString("vi-VN", { weekday: "long" }),
    };
  };

  const getStatusConfig = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    switch (statusLower) {
      case "confirmed":
        return {
          bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
          text: "text-green-700 dark:text-green-400",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
        };
      case "pending":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
          text: "text-yellow-700 dark:text-yellow-400",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      case "cancelled":
        return {
          bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          text: "text-red-700 dark:text-red-400",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      case "completed":
        return {
          bg: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  const fetchAllBookings = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await BookingsService.getAll({
        select: [
          "ID",
          "Title",
          "StartTime",
          "EndTime",
          "Status",
          "BookedBy",
          "MeetingRoom",
          "Description",
        ],
        orderBy: ["StartTime desc"],
      });

      if (result.data && user) {
        const mail = user.mail?.toLowerCase();
        const filtered = result.data.filter(
          (b) =>
            b.BookedBy?.Email?.toLowerCase() === mail ||
            b.BookedBy?.Claims?.toLowerCase().includes(mail || ""),
        );
        setMyBookings(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchAllBookings();
  }, [user]);

  const getUpcomingBookings = () => {
    const now = new Date();
    return myBookings.filter((booking) => new Date(booking.StartTime) > now);
  };

  const getPastBookings = () => {
    const now = new Date();
    return myBookings.filter((booking) => new Date(booking.StartTime) <= now);
  };

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  // Loading state đồng nhất với RoomList
  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-gray-300 border-t-violet-600 dark:border-gray-700 dark:border-t-violet-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đang tải danh sách đặt phòng...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Lịch sử đặt phòng
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  {myBookings.length} đặt chỗ
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Quản lý và theo dõi các phòng họp bạn đã đặt
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchAllBookings(true)}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-violet-600 dark:border-gray-700 dark:border-t-violet-500 rounded-full animate-spin mr-1.5"></div>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Làm mới
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Sắp diễn ra */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-500">
                    Sắp diễn ra
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {upcomingBookings.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Đã hoàn thành */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-500">
                    Đã hoàn thành
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pastBookings.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Người đặt */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-500">
                    Người đặt
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.displayName || "Khách"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {myBookings.length === 0 ? (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có đặt phòng nào
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Bạn chưa đặt phòng họp nào. Hãy bắt đầu đặt phòng để quản lý lịch
              họp của bạn.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Sắp diễn ra
                  </h2>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                    {upcomingBookings.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {upcomingBookings.map((booking) => {
                    const start = formatDateTime(booking.StartTime);
                    const end = formatDateTime(booking.EndTime);
                    const statusConfig = getStatusConfig(
                      booking.Status?.Value || "Pending",
                    );

                    return (
                      <div
                        key={booking.ID}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                                {booking.Title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-500 line-clamp-1">
                                {booking.Description || "Không có mô tả"}
                              </p>
                            </div>
                            <div className="ml-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border ${statusConfig.bg} ${statusConfig.text}`}
                              >
                                {statusConfig.icon}
                                <span>
                                  {booking.Status?.Value || "Pending"}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                Ngày
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {start.date}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                Thời gian
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {start.time} - {end.time}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                              <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-2">
                                <Building className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {booking.MeetingRoom?.Value || "Không xác định"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Đã hoàn thành
                  </h2>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                    {pastBookings.length}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                            Tiêu đề
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                            Phòng
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                            Ngày
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                            Thời gian
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pastBookings.map((booking) => {
                          const start = formatDateTime(booking.StartTime);
                          const end = formatDateTime(booking.EndTime);
                          const statusConfig = getStatusConfig(
                            booking.Status?.Value || "Completed",
                          );

                          return (
                            <tr
                              key={booking.ID}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                    {booking.Title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[200px]">
                                    {booking.Description || "Không có mô tả"}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-2">
                                    <Building className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                    {booking.MeetingRoom?.Value ||
                                      "Không xác định"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {start.date}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {start.dayName}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {start.time} - {end.time}
                                </p>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border ${statusConfig.bg} ${statusConfig.text}`}
                                >
                                  {statusConfig.icon}
                                  <span>
                                    {booking.Status?.Value || "Completed"}
                                  </span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-500">
              Hiển thị <span className="font-medium">{myBookings.length}</span>{" "}
              đặt chỗ
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Cần hỗ trợ? Liên hệ bộ phận Hành chính văn phòng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
