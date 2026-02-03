import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { Office365UsersService } from "../generated/services/Office365UsersService";
import { BookingsService } from "../generated/services/BookingsService";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Award,
  Languages,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarDays,
  ChevronRight,
  Home,
} from "lucide-react";

const UserProfilePage: React.FC = () => {
  const { user, loading: userLoading, refreshUser } = useUser();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
  });
  const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user photo
        const userEmail = user?.mail || user?.userPrincipalName;
        if (userEmail) {
          try {
            const photoResult =
              await Office365UsersService.UserPhoto_V2(userEmail);
            if (photoResult.data) {
              setUserPhoto(photoResult.data);
            }
          } catch (err) {
            console.log("User photo not available:", err);
          }
        }

        // Set user details
        const details = {
          displayName: user?.displayName || "Không có thông tin",
          email: user?.mail || user?.userPrincipalName || "Không có thông tin",
          givenName:
            user?.givenName ||
            user?.displayName?.split(" ")[0] ||
            "Không có thông tin",
          surname:
            user?.surname ||
            user?.displayName?.split(" ").slice(-1)[0] ||
            "Không có thông tin",
          jobTitle: user?.jobTitle || "Không có thông tin",
          department: user?.department || "Không có thông tin",
          company: user?.companyName || "Không có thông tin",
          location: user?.officeLocation || "Không có thông tin",
          phone:
            user?.mobilePhone ||
            (user?.businessPhones && user.businessPhones.length > 0
              ? user.businessPhones[0]
              : null) ||
            "Không có thông tin",
          hireDate: user?.hireDate
            ? new Date(user.hireDate).toLocaleDateString("vi-VN")
            : "Không có thông tin",
          preferredLanguage: user?.preferredLanguage
            ? user.preferredLanguage.split("-")[0].toUpperCase()
            : "Không có thông tin",
          userType: user?.userType || "Không có thông tin",
          city: user?.city || "Không có thông tin",
          country: user?.country || "Không có thông tin",
          userId: user?.id || "Không có thông tin",
          mailNickname: user?.mailNickname || "Không có thông tin",
        };

        setUserDetails(details);

        // Fetch recent bookings
        const emailForBooking = user?.mail || user?.userPrincipalName;
        if (emailForBooking) {
          try {
            const bookingsResult = await BookingsService.getAll({
              select: [
                "ID",
                "Title",
                "StartTime",
                "EndTime",
                "Status",
                "MeetingRoom",
                "BookedBy",
              ],
              orderBy: ["StartTime desc"],
              top: 10,
            });

            if (bookingsResult.data) {
              const userBookings = bookingsResult.data.filter((b) => {
                const bookedByEmail = b.BookedBy?.Email?.toLowerCase();
                const searchEmail = emailForBooking.toLowerCase();
                return bookedByEmail === searchEmail;
              });

              setRecentBookings(userBookings);

              const now = new Date();
              const upcoming = userBookings.filter(
                (b) => b.StartTime && new Date(b.StartTime) > now,
              ).length;
              const completed = userBookings.filter(
                (b) => b.StartTime && new Date(b.StartTime) <= now,
              ).length;

              setStats({
                totalBookings: userBookings.length,
                upcomingBookings: upcoming,
                completedBookings: completed,
              });
            }
          } catch (bookingError) {
            console.error("Error fetching bookings:", bookingError);
          }
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else if (!userLoading) {
      setIsLoading(false);
    }
  }, [user, userLoading]);

  const getInitials = (name: string) => {
    if (!name || name === "Không có thông tin") return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled":
      case "canceled":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400";
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-violet-400 dark:text-violet-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không thể tải thông tin người dùng
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vui lòng đăng nhập để xem trang hồ sơ.
          </p>
          <button
            onClick={() => refreshUser()}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hồ sơ cá nhân
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Thông tin tài khoản và lịch sử đặt phòng
            </p>
          </div>
          <button
            onClick={() => refreshUser()}
            className="inline-flex items-center px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  {userPhoto ? (
                    <img
                      src={`data:image/jpeg;base64,${userPhoto}`}
                      alt={userDetails?.displayName || "User"}
                      className="w-full h-full rounded-full border-4 border-white dark:border-gray-800 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white text-3xl font-bold">
                              ${getInitials(userDetails?.displayName || "User")}
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white text-3xl font-bold">
                      {getInitials(userDetails?.displayName || "User")}
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {userDetails?.displayName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {userDetails?.jobTitle}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  {userDetails?.department} • {userDetails?.company}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {stats.totalBookings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Tổng
                    </div>
                  </div>
                  <div className="text-center p-3 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                    <div className="text-xl font-bold text-violet-600 dark:text-violet-400">
                      {stats.upcomingBookings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Sắp tới
                    </div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.completedBookings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Hoàn thành
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-6 flex border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === "profile" ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-500" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    Thông tin
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === "bookings" ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-500" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    Đặt chỗ ({stats.totalBookings})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Thông tin cá nhân
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột 1 - Thông tin cơ bản */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="inline w-4 h-4 mr-2" />
                        Họ và tên
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.displayName}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="inline w-4 h-4 mr-2" />
                        Email
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.email}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Briefcase className="inline w-4 h-4 mr-2" />
                        Chức vụ
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.jobTitle}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Users className="inline w-4 h-4 mr-2" />
                        Phòng ban
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.department}
                        </span>
                      </div>
                    </div>

                    {/* Cột 2 - Thông tin bổ sung */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building className="inline w-4 h-4 mr-2" />
                        Công ty
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.company}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="inline w-4 h-4 mr-2" />
                        Số điện thoại
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.phone}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="inline w-4 h-4 mr-2" />
                        Vị trí
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.location}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Award className="inline w-4 h-4 mr-2" />
                        Ngày vào làm
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.hireDate}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Languages className="inline w-4 h-4 mr-2" />
                        Ngôn ngữ ưa thích
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.preferredLanguage}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Loại người dùng
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">
                          {userDetails?.userType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Lịch sử đặt chỗ
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Hiển thị 10 booking gần nhất
                      </p>
                    </div>
                    {recentBookings.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-emerald-500 mr-1" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Đã xác nhận
                          </span>
                        </div>
                        <div className="flex items-center">
                          <AlertCircle className="w-3 h-3 text-amber-500 mr-1" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Đang chờ
                          </span>
                        </div>
                        <div className="flex items-center">
                          <XCircle className="w-3 h-3 text-rose-500 mr-1" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Đã hủy
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CalendarDays className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Chưa có đặt chỗ nào
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Bạn chưa đặt phòng họp nào trong hệ thống.
                      </p>
                      <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Đặt phòng ngay
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {recentBookings.map((booking) => (
                          <div
                            key={booking.ID}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  {booking.Title || "Không có tiêu đề"}
                                </h4>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{formatDate(booking.StartTime)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>
                                      {formatTime(booking.StartTime)} -{" "}
                                      {formatTime(booking.EndTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Home className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>
                                      {booking.MeetingRoom?.Value ||
                                        "Không xác định"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.Status?.Value)}`}
                                >
                                  {booking.Status?.Value || "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            Hiển thị{" "}
                            <span className="font-semibold">
                              {recentBookings.length}
                            </span>{" "}
                            trong tổng số{" "}
                            <span className="font-semibold">
                              {stats.totalBookings}
                            </span>{" "}
                            booking
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-violet-500 mr-1"></div>
                              Sắp tới: {stats.upcomingBookings}
                            </span>
                            <span className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
                              Hoàn thành: {stats.completedBookings}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cần cập nhật thông tin? Vui lòng liên hệ bộ phận Nhân sự.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
