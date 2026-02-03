import React, { useState, useEffect } from "react";
import { MeetingRoomsService } from "../generated/services/MeetingRoomsService";
import { BookingsService } from "../generated/services/BookingsService";
import type { MeetingRooms } from "../generated/models/MeetingRoomsModel";
import type { Bookings } from "../generated/models/BookingsModel";
import { Link } from "react-router-dom";
import {
  Calendar,
  Search,
  MapPin,
  Users,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Grid,
  CalendarDays,
} from "lucide-react";

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<MeetingRooms[]>([]);
  const [bookings, setBookings] = useState<Bookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"card" | "calendar">("card");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const allResult = await MeetingRoomsService.getAll({
          select: [
            "ID",
            "Title",
            "Capacity",
            "Location",
            "Equipment",
            "Description",
            "IsActive",
          ],
        });

        if (allResult.data && allResult.data.length > 0) {
          setRooms(allResult.data);
        }
      } catch (err: any) {
        console.error("Lỗi khi lấy danh sách phòng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Fetch bookings for calendar view
  const fetchBookingsForDate = async (date: Date) => {
    setCalendarLoading(true);
    try {
      // Format date for filter
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // Fetch bookings for the selected date
      const result = await BookingsService.getAll({
        select: [
          "ID",
          "Title",
          "StartTime",
          "EndTime",
          "Status",
          "MeetingRoom",
          "BookedBy",
          "Description",
        ],
        filter: `StartTime ge '${startISO}' and StartTime le '${endISO}'`,
        orderBy: ["StartTime asc"],
      });

      if (result.data) {
        setBookings(result.data);
      }
    } catch (err: any) {
      console.error("Lỗi khi lấy lịch đặt phòng:", err);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Fetch bookings when date changes in calendar view
  useEffect(() => {
    if (viewMode === "calendar") {
      fetchBookingsForDate(selectedDate);
    }
  }, [selectedDate, viewMode]);

  const getEquipmentDisplay = (equipment: any): string => {
    if (!equipment) return "Cơ bản";
    if (equipment.Value) return equipment.Value;
    if (Array.isArray(equipment)) {
      return equipment
        .map((item) =>
          typeof item === "object" && item !== null ? item.Value : item,
        )
        .filter((val) => val)
        .join(", ");
    }
    return "Cơ bản";
  };

  const getCapacityLabel = (capacity: number): string => {
    if (!capacity) return "Không giới hạn";
    if (capacity < 10) return "1-9 người";
    if (capacity < 20) return "10-19 người";
    if (capacity < 50) return "20-49 người";
    return "50+ người";
  };

  const getCapacityColor = (capacity: number): string => {
    if (capacity < 10)
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
    if (capacity < 20)
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  };

  const getBookingColor = (booking: Bookings): string => {
    const status = booking.Status?.Value?.toLowerCase();
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "cancelled":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400";
    }
  };

  const getBookingIcon = (booking: Bookings) => {
    const status = booking.Status?.Value?.toLowerCase();
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.Location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEquipmentDisplay(room.Equipment)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (capacityFilter === "all") return true;
    if (capacityFilter === "small" && (!room.Capacity || room.Capacity < 10))
      return true;
    if (
      capacityFilter === "medium" &&
      room.Capacity &&
      room.Capacity >= 10 &&
      room.Capacity < 20
    )
      return true;
    if (capacityFilter === "large" && room.Capacity && room.Capacity >= 20)
      return true;

    return false;
  });

  // Get bookings for a specific room
  const getBookingsForRoom = (roomId: number) => {
    return bookings.filter((booking) => booking.MeetingRoom?.Id === roomId);
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Navigate to previous/next day
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 rounded-full animate-spin border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Đang tải danh sách phòng họp...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with View Toggle */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Danh sách phòng họp
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {viewMode === "card"
                  ? `${filteredRooms.length} phòng có sẵn`
                  : `Lịch đặt phòng ngày ${formatDisplayDate(selectedDate)}`}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "card"
                      ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Grid className="w-4 h-4" />
                    <span>Card View</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "calendar"
                      ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>Calendar View</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, vị trí hoặc thiết bị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
              />
              <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
            </div>
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            >
              <option value="all">Tất cả quy mô</option>
              <option value="small">Nhỏ (dưới 10 người)</option>
              <option value="medium">Vừa (10-20 người)</option>
              <option value="large">Lớn (trên 20 người)</option>
            </select>
          </div>
        </div>

        {/* Calendar View Mode */}
        {viewMode === "calendar" ? (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateDate("prev")}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatDisplayDate(selectedDate)}
                  </h2>
                  <button
                    onClick={() => navigateDate("next")}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-4 py-2 text-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/40 transition-colors"
                  >
                    Hôm nay
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-emerald-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Đã xác nhận
                    </span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-3 h-3 text-amber-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Đang chờ
                    </span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="w-3 h-3 text-rose-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Đã hủy
                    </span>
                  </div>
                </div>
              </div>

              {calendarLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 rounded-full animate-spin border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400"></div>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Không tìm thấy phòng phù hợp
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRooms.map((room) => {
                    const roomBookings = getBookingsForRoom(room.ID || 0);
                    return (
                      <div
                        key={room.ID}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                      >
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {room.Title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {room.Location} •{" "}
                                {getCapacityLabel(room.Capacity || 0)}
                              </p>
                            </div>
                            <Link
                              to={`/book?roomId=${room.ID}&roomName=${encodeURIComponent(room.Title || "")}`}
                              className="px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-all"
                            >
                              Đặt phòng
                            </Link>
                          </div>
                        </div>

                        <div className="p-6">
                          {roomBookings.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500 dark:text-gray-400">
                                Không có lịch đặt phòng nào trong ngày này
                              </p>
                              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                Phòng trống cả ngày - Hãy đặt ngay!
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {roomBookings.map((booking) => (
                                <div
                                  key={booking.ID}
                                  className={`p-4 rounded-lg ${getBookingColor(booking)}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-3">
                                      {getBookingIcon(booking)}
                                      <div>
                                        <h4 className="font-bold mb-1">
                                          {booking.Title || "Không có tiêu đề"}
                                        </h4>
                                        <p className="text-sm opacity-90 flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {formatTime(
                                            booking.StartTime || "",
                                          )}{" "}
                                          - {formatTime(booking.EndTime || "")}
                                        </p>
                                        {booking.BookedBy?.DisplayName && (
                                          <p className="text-xs opacity-80 mt-1 flex items-center">
                                            <User className="w-3 h-3 mr-1" />
                                            {booking.BookedBy.DisplayName}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                                      {booking.Status?.Value || "Pending"}
                                    </span>
                                  </div>
                                  {booking.Description && (
                                    <p className="text-sm mt-2 opacity-90 line-clamp-2">
                                      {booking.Description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : /* Card View Mode (Original) */
        filteredRooms.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Không tìm thấy phòng
            </h3>
            <button
              onClick={() => {
                setSearchTerm("");
                setCapacityFilter("all");
              }}
              className="mt-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.ID}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="h-1 bg-violet-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {room.Title}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getCapacityColor(room.Capacity || 0)}`}
                    >
                      {getCapacityLabel(room.Capacity || 0)}
                    </span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-violet-500 mt-1" />
                      <div className="ml-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Vị trí
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                          {room.Location || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-violet-500 mt-1" />
                      <div className="ml-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Sức chứa
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                          {room.Capacity || "Không giới hạn"} người
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Monitor className="w-5 h-5 text-violet-500 mt-1" />
                      <div className="ml-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Thiết bị
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                          {getEquipmentDisplay(room.Equipment)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/book?roomId=${room.ID}&roomName=${encodeURIComponent(room.Title || "")}`}
                    className="block w-full py-3 px-4 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-all duration-300 text-center"
                  >
                    Đặt phòng này
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-500">
            Cần hỗ trợ? Liên hệ bộ phận Hành chính văn phòng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomList;
