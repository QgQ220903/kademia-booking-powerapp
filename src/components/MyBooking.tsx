import React, { useState, useEffect } from "react";
import { BookingsService } from "../generated/services/BookingsService";
import { useUser } from "../contexts/UserContext";

const MyBookings: React.FC = () => {
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();

  const formatDateTime = (utcString: string) => {
    if (!utcString) return { date: "", time: "", fullDate: "" };
    const date = new Date(utcString);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      fullDate: date,
      dayName: date.toLocaleDateString("vi-VN", { weekday: "long" }),
    };
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: string }> =
      {
        Confirmed: {
          bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-700 dark:text-emerald-400",
          icon: "✓",
        },
        Pending: {
          bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
          text: "text-amber-700 dark:text-amber-400",
          icon: "⏳",
        },
        Cancelled: {
          bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          text: "text-red-700 dark:text-red-400",
          icon: "✗",
        },
        Completed: {
          bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          text: "text-blue-700 dark:text-blue-400",
          icon: "✓",
        },
      };
    return configs[status] || configs.Pending;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lịch sử đặt phòng
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Quản lý và theo dõi các phòng họp bạn đã đặt
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700">
                <span className="font-medium">{myBookings.length}</span> đặt chỗ
              </div>
              <button
                onClick={() => fetchAllBookings(true)}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Làm mới
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sắp diễn ra
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {upcomingBookings.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Đã hoàn thành
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pastBookings.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Người đặt
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {user?.displayName || "Khách"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Đang tải lịch sử đặt phòng...
            </p>
          </div>
        ) : myBookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có đặt phòng nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
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
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sắp diễn ra
                  </h2>
                  <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full">
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
                        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow duration-200"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {booking.Title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {booking.Description || "Không có mô tả"}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              <span className="mr-1">{statusConfig.icon}</span>
                              {booking.Status?.Value || "Pending"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Ngày
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {start.date}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Thời gian
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {start.time} - {end.time}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mr-2">
                                <svg
                                  className="w-4 h-4 text-gray-600 dark:text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
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
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Đã hoàn thành
                  </h2>
                  <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 rounded-full">
                    {pastBookings.length}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Tiêu đề
                          </th>
                          <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Phòng
                          </th>
                          <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Ngày
                          </th>
                          <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Thời gian
                          </th>
                          <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {pastBookings.map((booking) => {
                          const start = formatDateTime(booking.StartTime);
                          const end = formatDateTime(booking.EndTime);
                          const statusConfig = getStatusConfig(
                            booking.Status?.Value || "Completed",
                          );

                          return (
                            <tr
                              key={booking.ID}
                              className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {booking.Title}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                    {booking.Description || "Không có mô tả"}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center mr-2">
                                    <svg
                                      className="w-4 h-4 text-gray-600 dark:text-gray-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {booking.MeetingRoom?.Value ||
                                      "Không xác định"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div>
                                  <p className="text-gray-700 dark:text-gray-300">
                                    {start.date}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {start.dayName}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-gray-700 dark:text-gray-300">
                                  {start.time} - {end.time}
                                </p>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                                >
                                  <span className="mr-1">
                                    {statusConfig.icon}
                                  </span>
                                  {booking.Status?.Value || "Completed"}
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
      </div>
    </div>
  );
};

export default MyBookings;
