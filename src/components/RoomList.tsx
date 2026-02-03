import React, { useState, useEffect, useRef } from "react";
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
  Building,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const getEquipmentDisplay = (equipment: any): string => {
    if (!equipment) return "Thiết bị cơ bản";
    if (equipment.Value) return equipment.Value;
    if (Array.isArray(equipment)) {
      const items = equipment
        .map((item) =>
          typeof item === "object" && item !== null ? item.Value : item,
        )
        .filter((val) => val);
      return items.join(", ") || "Thiết bị cơ bản";
    }
    return "Thiết bị cơ bản";
  };

  const getCapacityLabel = (capacity: number): string => {
    if (!capacity) return "Không giới hạn";
    return `${capacity} người`;
  };

  const getCapacityColor = (): string => {
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const getBookingColor = (booking: Bookings): string => {
    const status = booking.Status?.Value?.toLowerCase();
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      case "cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
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

  // Generate days for quick navigation
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

    // Next 3 days
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

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-3 border-gray-300 border-t-violet-600 dark:border-gray-700 dark:border-t-violet-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Đang tải danh sách phòng họp...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with View Toggle */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Phòng họp
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {viewMode === "card"
                  ? `${filteredRooms.length} phòng có sẵn`
                  : `Lịch đặt phòng - ${formatDisplayDate(selectedDate)}`}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-1">
                <button
                  onClick={() => setViewMode("card")}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded ${
                    viewMode === "card"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border border-gray-300 dark:border-gray-700"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Danh sách
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded ${
                    viewMode === "calendar"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border border-gray-300 dark:border-gray-700"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Lịch họp
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng họp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="all">Tất cả sức chứa</option>
                  <option value="small">Nhỏ (dưới 10 người)</option>
                  <option value="medium">Vừa (10-20 người)</option>
                  <option value="large">Lớn (trên 20 người)</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Calendar View Mode */}
        {viewMode === "calendar" ? (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                {/* Date Navigation */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateDate("prev")}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1" ref={datePickerRef}>
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="inline-flex items-center justify-between w-full md:w-auto px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDisplayDate(selectedDate)}
                      </span>
                      <CalendarIcon className="w-4 h-4 ml-2 text-gray-500" />
                    </button>

                    {showDatePicker && (
                      <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-3">
                        {/* Date Input */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Chọn ngày
                          </label>
                          <input
                            type="date"
                            value={formatDateForInput(selectedDate)}
                            onChange={handleDateSelect}
                            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                        </div>

                        {/* Quick Date Selection */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Chọn nhanh
                          </p>
                          <div className="grid grid-cols-3 gap-1">
                            {generateDateOptions().map((option, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedDate(option.date);
                                  setShowDatePicker(false);
                                }}
                                className={`px-2 py-1.5 text-xs rounded ${
                                  selectedDate.toDateString() ===
                                  option.date.toDateString()
                                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Đã xác nhận
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Đang chờ
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Đã hủy
                    </span>
                  </div>
                </div>
              </div>

              {calendarLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-3 border-gray-300 border-t-violet-600 dark:border-gray-700 dark:border-t-violet-500 rounded-full animate-spin"></div>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Không tìm thấy phòng phù hợp
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRooms.map((room) => {
                    const roomBookings = getBookingsForRoom(room.ID || 0);
                    return (
                      <div
                        key={room.ID}
                        className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {room.Title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                  <MapPin className="w-3.5 h-3.5 mr-1" />
                                  {room.Location}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                  <Users className="w-3.5 h-3.5 mr-1" />
                                  {getCapacityLabel(room.Capacity || 0)}
                                </span>
                              </div>
                            </div>
                            <Link
                              to={`/book?roomId=${room.ID}&roomName=${encodeURIComponent(room.Title || "")}`}
                              className="inline-flex items-center px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-md"
                            >
                              Đặt phòng
                            </Link>
                          </div>
                        </div>

                        <div className="p-4">
                          {/* Equipment info */}
                          <div className="mb-4">
                            <div className="flex items-start gap-2">
                              <Monitor className="w-4 h-4 mt-0.5 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {getEquipmentDisplay(room.Equipment)}
                              </span>
                            </div>
                          </div>

                          {roomBookings.length === 0 ? (
                            <div className="text-center py-6">
                              <p className="text-gray-500 dark:text-gray-400">
                                Không có lịch đặt phòng nào trong ngày này
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {roomBookings.map((booking) => (
                                <div
                                  key={booking.ID}
                                  className={`px-3 py-2 rounded-md ${getBookingColor(booking)}`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm mb-1">
                                        {booking.Title || "Không có tiêu đề"}
                                      </h4>
                                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>
                                          {formatTime(booking.StartTime || "")}{" "}
                                          - {formatTime(booking.EndTime || "")}
                                        </span>
                                        {booking.BookedBy?.DisplayName && (
                                          <>
                                            <span className="mx-2">•</span>
                                            <User className="w-3 h-3 mr-1" />
                                            <span>
                                              {booking.BookedBy.DisplayName}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center ml-2">
                                      {getBookingIcon(booking)}
                                      <span className="text-xs font-medium ml-1">
                                        {booking.Status?.Value || "Pending"}
                                      </span>
                                    </div>
                                  </div>
                                  {booking.Description && (
                                    <p className="text-xs mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
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
        ) : /* Card View Mode (Simplified) */
        filteredRooms.length === 0 ? (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
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
              className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4 mr-1.5" />
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <div
                key={room.ID}
                className="group border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {room.Title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getCapacityColor()}`}
                    >
                      {getCapacityLabel(room.Capacity || 0)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Building className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>{room.Location || "Chưa cập nhật"}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Equipment - Simple */}
                  <div className="mb-4">
                    <div className="flex items-start gap-2">
                      <Monitor className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                          Thiết bị
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getEquipmentDisplay(room.Equipment)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity - Simple */}
                  <div className="mb-6">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                          Sức chứa
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {room.Capacity || "Không giới hạn"} người
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${room.IsActive ? "bg-emerald-500" : "bg-rose-500"}`}
                      ></div>
                      <span>
                        {room.IsActive ? "Đang hoạt động" : "Tạm đóng"}
                      </span>
                    </div>
                    <span>ID: {room.ID}</span>
                  </div>

                  {/* Booking Button */}
                  <Link
                    to={`/book?roomId=${room.ID}&roomName=${encodeURIComponent(room.Title || "")}`}
                    className="block w-full text-center py-2.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-md"
                  >
                    Đặt phòng
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị{" "}
              <span className="font-medium">{filteredRooms.length}</span> trong
              tổng số <span className="font-medium">{rooms.length}</span> phòng
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

export default RoomList;
