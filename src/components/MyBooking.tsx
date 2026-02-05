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
  X,
  Clock,
  AlertTriangle,
  Info,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const MyBookings: React.FC = () => {
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();

  // State cho chức năng hủy phòng
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null,
  );
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(
    null,
  );
  const [showPastBookings, setShowPastBookings] = useState(false);

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
      dateTime: date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
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
          label: "Đã xác nhận",
          canCancel: true,
        };
      case "pending":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
          text: "text-amber-700 dark:text-amber-400",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: "Đang chờ",
          canCancel: true,
        };
      case "cancelled":
        return {
          bg: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: "Đã hủy",
          canCancel: false,
        };
      case "completed":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          text: "text-blue-700 dark:text-blue-400",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: "Đã hoàn thành",
          canCancel: false,
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: "Không xác định",
          canCancel: false,
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
          "Created",
          "Modified",
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
      console.error("Lỗi khi tải danh sách đặt phòng:", err);
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
    return myBookings.filter((booking) => {
      const bookingDate = new Date(booking.StartTime);
      const isUpcoming = bookingDate > now;
      const isNotCancelled =
        booking.Status?.Value?.toLowerCase() !== "cancelled";
      return isUpcoming && isNotCancelled;
    });
  };

  const getPastBookings = () => {
    const now = new Date();
    return myBookings.filter((booking) => {
      const bookingDate = new Date(booking.StartTime);
      return (
        bookingDate <= now ||
        booking.Status?.Value?.toLowerCase() === "cancelled"
      );
    });
  };

  const canCancelBooking = (booking: any) => {
    const now = new Date();
    const bookingStart = new Date(booking.StartTime);
    const hoursUntilBooking =
      (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Có thể hủy nếu:
    // 1. Chưa diễn ra (booking chưa bắt đầu)
    // 2. Chưa bị hủy trước đó
    // 3. Còn ít nhất 1 giờ trước khi cuộc họp bắt đầu (chính sách hủy muộn)
    const canCancel =
      bookingStart > now &&
      booking.Status?.Value?.toLowerCase() !== "cancelled" &&
      hoursUntilBooking >= 1;

    return canCancel;
  };

  const getTimeUntilBooking = (booking: any) => {
    const now = new Date();
    const bookingStart = new Date(booking.StartTime);
    const hoursUntil =
      (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 0) return { text: "Đã qua", color: "text-gray-500" };
    if (hoursUntil < 1) return { text: "Sắp bắt đầu", color: "text-rose-500" };
    if (hoursUntil < 24) return { text: "Trong ngày", color: "text-amber-500" };
    if (hoursUntil < 48) return { text: "Ngày mai", color: "text-blue-500" };
    return { text: "Sắp tới", color: "text-green-500" };
  };

  const handleCancelBooking = async () => {
    if (!cancellingBookingId || !cancellationReason.trim()) return;

    setCancelling(true);
    try {
      // Cập nhật trạng thái booking thành "Cancelled"
      const updateData = {
        Status: {
          "@odata.type": "#Microsoft.PowerApps.ChecklistValue",
          Value: "Cancelled",
          Id: 3, // ID cho trạng thái Cancelled (cần xác định từ hệ thống của bạn)
        },
        Description: `[ĐÃ HỦY - Lý do: ${cancellationReason}] ${cancellationReason.trim()}\n\nLịch đặt ban đầu: ${
          formatDateTime(
            myBookings.find((b) => b.ID === cancellingBookingId)?.StartTime ||
              "",
          ).dateTime
        }\nThời gian hủy: ${new Date().toLocaleString("vi-VN")}\nNgười hủy: ${user?.displayName}`,
      };

      await BookingsService.update(cancellingBookingId.toString(), updateData);

      // Refresh danh sách
      await fetchAllBookings();

      // Reset state
      setShowCancelModal(false);
      setCancellingBookingId(null);
      setCancellationReason("");

      alert("✅ Đã hủy đặt phòng thành công!");
    } catch (error: any) {
      console.error("Lỗi khi hủy đặt phòng:", error);
      alert("❌ Không thể hủy đặt phòng. Vui lòng thử lại sau.");
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = (bookingId: number) => {
    const booking = myBookings.find((b) => b.ID === bookingId);
    if (!booking || !canCancelBooking(booking)) return;

    setCancellingBookingId(bookingId);
    setCancellationReason("");
    setShowCancelModal(true);
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
    <>
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

            {/* Stats Cards - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

              {/* Có thể hủy */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded flex items-center justify-center mr-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-500">
                      Có thể hủy
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {upcomingBookings.filter(canCancelBooking).length}
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
                      {
                        pastBookings.filter(
                          (b) => b.Status?.Value?.toLowerCase() !== "cancelled",
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Đã hủy */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
                    <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-500">
                      Đã hủy
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {
                        myBookings.filter(
                          (b) => b.Status?.Value?.toLowerCase() === "cancelled",
                        ).length
                      }
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
                Bạn chưa đặt phòng họp nào. Hãy bắt đầu đặt phòng để quản lý
                lịch họp của bạn.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Sắp diễn ra
                      </h2>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        {upcomingBookings.length}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      * Có thể hủy trước 1 giờ cuộc họp bắt đầu
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {upcomingBookings.map((booking) => {
                      const start = formatDateTime(booking.StartTime);
                      const end = formatDateTime(booking.EndTime);
                      const statusConfig = getStatusConfig(
                        booking.Status?.Value || "Pending",
                      );
                      const timeInfo = getTimeUntilBooking(booking);
                      const canCancel = canCancelBooking(booking);
                      const isExpanded = expandedBookingId === booking.ID;

                      return (
                        <div
                          key={booking.ID}
                          className={`bg-white dark:bg-gray-800 border ${
                            canCancel
                              ? "border-amber-200 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          } rounded-lg transition-all duration-200`}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {booking.Title}
                                  </h3>
                                  <span
                                    className={`text-xs font-medium ${timeInfo.color}`}
                                  >
                                    {timeInfo.text}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-500 line-clamp-1">
                                  {booking.Description || "Không có mô tả"}
                                </p>
                              </div>
                              <div className="ml-2 flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border ${statusConfig.bg} ${statusConfig.text}`}
                                >
                                  {statusConfig.icon}
                                  <span>{statusConfig.label}</span>
                                </span>
                                <button
                                  onClick={() =>
                                    setExpandedBookingId(
                                      isExpanded ? null : booking.ID,
                                    )
                                  }
                                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                      Thời gian tạo
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {formatDateTime(booking.Created).dateTime}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                      Cập nhật cuối
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {
                                        formatDateTime(booking.Modified)
                                          .dateTime
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                  Ngày
                                </p>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {start.date} ({start.dayName})
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                  Thời gian
                                </p>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {start.time} - {end.time}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center">
                                <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-2">
                                  <Building className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {booking.MeetingRoom?.Value ||
                                    "Không xác định"}
                                </span>
                              </div>

                              {canCancel && (
                                <button
                                  onClick={() => openCancelModal(booking.ID)}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                  Hủy đặt phòng
                                </button>
                              )}
                            </div>

                            {!canCancel && statusConfig.label !== "Đã hủy" && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 italic">
                                <Info className="w-3.5 h-3.5 inline mr-1" />
                                Không thể hủy khi cuộc họp còn dưới 1 giờ
                              </div>
                            )}
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Lịch sử đã qua
                      </h2>
                      <button
                        onClick={() => setShowPastBookings(!showPastBookings)}
                        className="ml-2 px-2.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                      >
                        {pastBookings.length}
                        {showPastBookings ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {showPastBookings && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
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
                                        {booking.Description ||
                                          "Không có mô tả"}
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
                                      <span>{statusConfig.label}</span>
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-500">
                  Hiển thị{" "}
                  <span className="font-medium">{myBookings.length}</span> đặt
                  chỗ • Có thể hủy:{" "}
                  <span className="font-medium">
                    {upcomingBookings.filter(canCancelBooking).length}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    Chính sách hủy: Có thể hủy trước 1 giờ cuộc họp bắt đầu
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Cần hỗ trợ? Liên hệ bộ phận Hành chính văn phòng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal hủy đặt phòng */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => !cancelling && setShowCancelModal(false)}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full mx-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Xác nhận hủy đặt phòng
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Hành động này không thể hoàn tác
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !cancelling && setShowCancelModal(false)}
                  disabled={cancelling}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thông tin booking */}
              {cancellingBookingId && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  {(() => {
                    const booking = myBookings.find(
                      (b) => b.ID === cancellingBookingId,
                    );
                    if (!booking) return null;
                    const start = formatDateTime(booking.StartTime);
                    return (
                      <>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {booking.Title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500">
                          <Building className="w-3 h-3" />
                          <span>
                            {booking.MeetingRoom?.Value || "Không xác định"}
                          </span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{start.dateTime}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Lý do hủy */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Lý do hủy <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Vui lòng nhập lý do hủy đặt phòng..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  disabled={cancelling}
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Lý do hủy sẽ được ghi lại trong hệ thống
                </p>
              </div>

              {/* Lưu ý */}
              <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      Lưu ý quan trọng
                    </p>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1">
                      <li>• Không thể hủy khi cuộc họp còn dưới 1 giờ</li>
                      <li>• Phòng sẽ được giải phóng cho người khác đặt</li>
                      <li>• Email thông báo sẽ được gửi đến bạn</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => !cancelling && setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={!cancellationReason.trim() || cancelling}
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {cancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận hủy"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;
