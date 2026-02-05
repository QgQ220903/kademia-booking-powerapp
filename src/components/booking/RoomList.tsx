import React, { useState, useEffect, useRef } from "react";
import { MeetingRoomsService } from "../../generated/services/MeetingRoomsService";
import { BookingsService } from "../../generated/services/BookingsService";
import type { MeetingRooms } from "../../generated/models/MeetingRoomsModel";
import type { Bookings } from "../../generated/models/BookingsModel";
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
  Building,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Filter,
  Lock,
} from "lucide-react";

const RoomList: React.FC = () => {
  // GIỮ NGUYÊN TẤT CẢ LOGIC STATE
  const [rooms, setRooms] = useState<MeetingRooms[]>([]);
  const [bookings, setBookings] = useState<Bookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"card" | "calendar">("card");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

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

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch bookings for calendar view
  const fetchBookingsForDate = async (date: Date) => {
    setCalendarLoading(true);
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

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

  useEffect(() => {
    if (viewMode === "calendar") {
      fetchBookingsForDate(selectedDate);
    }
  }, [selectedDate, viewMode]);

  // HELPER FUNCTIONS
  const parseEquipmentToBadges = (equipment: any): string[] => {
    if (!equipment) return ["Cơ bản"];

    try {
      if (typeof equipment === "string") {
        return equipment
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item)
          .slice(0, 4);
      }

      if (equipment.Value) {
        if (typeof equipment.Value === "string") {
          return equipment.Value.split(",")
            .map((item: string) => item.trim())
            .filter((item: string) => item)
            .slice(0, 4);
        }
        return [equipment.Value.toString()];
      }

      if (Array.isArray(equipment)) {
        return equipment
          .map((item) => {
            if (typeof item === "object" && item !== null && item.Value) {
              return item.Value.toString();
            }
            return item?.toString();
          })
          .filter((item) => item && item.trim())
          .slice(0, 4);
      }

      return ["Cơ bản"];
    } catch (error) {
      console.error("Error parsing equipment:", error);
      return ["Cơ bản"];
    }
  };

  const getEquipmentDisplay = (equipment: any): string => {
    const badges = parseEquipmentToBadges(equipment);
    return badges.join(", ") || "Thiết bị cơ bản";
  };

  const getCapacityLabel = (capacity: number): string => {
    if (!capacity) return "Không giới hạn";
    if (capacity < 5) return "Nhỏ";
    if (capacity < 10) return "Vừa";
    if (capacity < 20) return "Lớn";
    return "Rất lớn";
  };

  const getCapacityColor = (capacity: number): string => {
    if (!capacity)
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    if (capacity < 5)
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    if (capacity < 10)
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    if (capacity < 20)
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const getRoomCardStyle = (isActive: boolean) => {
    return isActive
      ? "group border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all flex flex-col"
      : "group border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex flex-col opacity-90";
  };

  const getBookingColor = (booking: Bookings): string => {
    const status = booking.Status?.Value?.toLowerCase();
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
      case "cancelled":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
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

  const getBookingsForRoom = (roomId: number) => {
    return bookings.filter((booking) => booking.MeetingRoom?.Id === roomId);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const generateDateOptions = () => {
    const today = new Date();
    const options = [];

    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    options.push({ label: "Hôm qua", date: yesterday });

    // Today
    options.push({ label: "Hôm nay", date: today });

    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    options.push({ label: "Ngày mai", date: tomorrow });

    for (let i = 2; i <= 4; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(nextDay.getDate() + i);
      options.push({
        label: nextDay.toLocaleDateString("vi-VN", { weekday: "short" }),
        date: nextDay,
      });
    }

    return options;
  };

  // Thống kê nhanh
  const roomStats = {
    total: rooms.length,
    available: rooms.filter((r) => r.IsActive).length,
    small: rooms.filter((r) => r.Capacity && r.Capacity < 10).length,
    medium: rooms.filter(
      (r) => r.Capacity && r.Capacity >= 10 && r.Capacity < 20,
    ).length,
    large: rooms.filter((r) => r.Capacity && r.Capacity >= 20).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-gray-300 border-t-violet-600 dark:border-gray-700 dark:border-t-violet-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Building className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đang tải danh sách phòng họp...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Phòng họp
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  {roomStats.available}/{roomStats.total} phòng
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                {viewMode === "card"
                  ? `Tìm thấy ${filteredRooms.length} phòng phù hợp`
                  : `Lịch đặt phòng - ${formatDisplayDate(selectedDate)}`}
              </p>
            </div>

            {/* Enhanced View Toggle */}
            <div className="flex items-center space-x-3">
              <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
                <button
                  onClick={() => setViewMode("card")}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === "card"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Danh sách
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === "calendar"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Lịch họp
                </button>
              </div>

              {/* Quick Stats */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </button>
            </div>
          </div>

          {/* Enhanced Search & Filter Section */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng họp, vị trí hoặc thiết bị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Simple Capacity Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCapacityFilter("all")}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    capacityFilter === "all"
                      ? "bg-gray-900 dark:bg-gray-800 text-white dark:text-white border-gray-900 dark:border-gray-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Tất cả ({roomStats.total})
                </button>
                <button
                  onClick={() => setCapacityFilter("small")}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    capacityFilter === "small"
                      ? "bg-gray-900 dark:bg-gray-800 text-white dark:text-white border-gray-900 dark:border-gray-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Nhỏ ({roomStats.small})
                </button>
                <button
                  onClick={() => setCapacityFilter("medium")}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    capacityFilter === "medium"
                      ? "bg-gray-900 dark:bg-gray-800 text-white dark:text-white border-gray-900 dark:border-gray-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Vừa ({roomStats.medium})
                </button>
                <button
                  onClick={() => setCapacityFilter("large")}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    capacityFilter === "large"
                      ? "bg-gray-900 dark:bg-gray-800 text-white dark:text-white border-gray-900 dark:border-gray-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Lớn ({roomStats.large})
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{filteredRooms.length}</span>{" "}
                phòng đang hiển thị
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View Mode - Enhanced */}
        {viewMode === "calendar" ? (
          <div className="space-y-6">
            {/* Enhanced Calendar Header */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                {/* Date Navigation */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigateDate("prev")}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="relative" ref={datePickerRef}>
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="inline-flex items-center justify-between w-full md:w-auto px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDisplayDate(selectedDate)}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                    </button>

                    {showDatePicker && (
                      <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-4">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Chọn ngày
                          </label>
                          <input
                            type="date"
                            value={formatDateForInput(selectedDate)}
                            onChange={handleDateSelect}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Chọn nhanh
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {generateDateOptions().map((option, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedDate(option.date);
                                  setShowDatePicker(false);
                                }}
                                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                                  selectedDate.toDateString() ===
                                  option.date.toDateString()
                                    ? "bg-violet-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigateDate("next")}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Enhanced Legend */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Đã xác nhận
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Đang chờ
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Đã hủy
                    </span>
                  </div>
                </div>
              </div>

              {calendarLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-2 border-gray-300 border-t-violet-600 dark:border-gray-700 dark:border-t-violet-500 rounded-full animate-spin"></div>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-14 h-14 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Không tìm thấy phòng phù hợp
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRooms.map((room) => {
                    const roomBookings = getBookingsForRoom(room.ID || 0);
                    const equipmentBadges = parseEquipmentToBadges(
                      room.Equipment,
                    );

                    return (
                      <div
                        key={room.ID}
                        className={getRoomCardStyle(room.IsActive || false)}
                      >
                        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {room.Title}
                                  {!room.IsActive && (
                                    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                      <Lock className="w-3 h-3 inline mr-1" />
                                      Tạm đóng
                                    </span>
                                  )}
                                </h3>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs ${getCapacityColor(room.Capacity || 0)}`}
                                >
                                  {getCapacityLabel(room.Capacity || 0)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                  <MapPin className="w-4 h-4 mr-1.5" />
                                  {room.Location}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                  <Users className="w-4 h-4 mr-1.5" />
                                  {room.Capacity || "∞"} người
                                </span>
                              </div>
                            </div>
                            {room.IsActive ? (
                              <Link
                                to={`/book?roomId=${room.ID}&roomName=${encodeURIComponent(room.Title || "")}`}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                              >
                                Đặt phòng
                              </Link>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                              >
                                <Lock className="w-4 h-4 mr-1.5" />
                                Không thể đặt
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-5">
                          {/* Equipment badges */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Monitor className="w-5 h-5 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Thiết bị
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {equipmentBadges.map((item, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>

                          {roomBookings.length === 0 ? (
                            <div className="text-center py-6">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400">
                                Không có lịch đặt phòng nào trong ngày này
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {roomBookings.map((booking) => (
                                <div
                                  key={booking.ID}
                                  className={`px-4 py-3 rounded-lg ${getBookingColor(booking)}`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                                        {booking.Title || "Không có tiêu đề"}
                                      </h4>
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center">
                                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                                          <span>
                                            {formatTime(
                                              booking.StartTime || "",
                                            )}{" "}
                                            -{" "}
                                            {formatTime(booking.EndTime || "")}
                                          </span>
                                        </div>
                                        {booking.BookedBy?.DisplayName && (
                                          <div className="flex items-center">
                                            <User className="w-3.5 h-3.5 mr-1.5" />
                                            <span>
                                              {booking.BookedBy.DisplayName}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      {getBookingIcon(booking)}
                                      <span className="text-xs font-medium">
                                        {booking.Status?.Value || "Pending"}
                                      </span>
                                    </div>
                                  </div>
                                  {booking.Description && (
                                    <p className="text-xs mt-2 text-gray-600 dark:text-gray-400 line-clamp-1">
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
        ) : /* Card View Mode - Enhanced với Equipment Badges */
        filteredRooms.length === 0 ? (
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Không tìm thấy phòng
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Không có phòng nào phù hợp với tiêu chí tìm kiếm
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setCapacityFilter("all");
              }}
              className="inline-flex items-center px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const equipmentBadges = parseEquipmentToBadges(room.Equipment);

              return (
                <div
                  key={room.ID}
                  className={getRoomCardStyle(room.IsActive || false)}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {room.Title}
                          </h3>
                          {!room.IsActive && (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              <Lock className="w-3 h-3 inline mr-1" />
                              Tạm đóng
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-500">
                          <Building className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          <span className="truncate">
                            {room.Location || "Chưa cập nhật"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs ${getCapacityColor(room.Capacity || 0)}`}
                        >
                          {getCapacityLabel(room.Capacity || 0)}
                        </span>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${room.IsActive ? "bg-green-500" : "bg-red-500"}`}
                          title={room.IsActive ? "Đang hoạt động" : "Tạm đóng"}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content - Equipment Badges */}
                  <div className="p-5 flex-1 overflow-hidden">
                    {/* Equipment Badges */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Thiết bị
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {equipmentBadges.map((item, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Capacity Info */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Sức chứa: {room.Capacity || "∞"} người</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-medium">ID:</span> {room.ID}
                      </div>
                      {room.IsActive ? (
                        <Link
                          to={`/book?roomId=${room.ID}&roomName=${encodeURIComponent(room.Title || "")}`}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors group-hover:shadow-md"
                        >
                          Đặt phòng
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4 mr-1.5" />
                          Không thể đặt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Hiển thị{" "}
                <span className="font-medium">{filteredRooms.length}</span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{rooms.length}</span> phòng
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                  <span>{roomStats.available} phòng đang hoạt động</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
                  <span>
                    {rooms.length - roomStats.available} phòng tạm đóng
                  </span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Cần hỗ trợ? Liên hệ bộ phận Hành chính văn phòng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomList;
