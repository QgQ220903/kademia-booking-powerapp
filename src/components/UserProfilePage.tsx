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
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

const UserProfilePage: React.FC = () => {
  // TẤT CẢ LOGIC NÀY GIỮ NGUYÊN 100%
  const { user, loading: userLoading, refreshUser } = useUser();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
  });
  const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");
  const [isLoading, setIsLoading] = useState(true);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [pagedBookings, setPagedBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

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

        // Fetch all bookings
        await fetchAllBookings();
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

  const fetchAllBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const emailForBooking = user?.mail || user?.userPrincipalName;
      if (!emailForBooking) return;

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
      });

      if (bookingsResult.data) {
        const userBookings = bookingsResult.data.filter((b) => {
          const bookedByEmail = b.BookedBy?.Email?.toLowerCase();
          const searchEmail = emailForBooking.toLowerCase();
          return bookedByEmail === searchEmail;
        });

        setAllBookings(userBookings);

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

        // Tính toán phân trang
        setTotalPages(Math.ceil(userBookings.length / itemsPerPage));
        updatePagedBookings(userBookings, 1, itemsPerPage);
      }
    } catch (bookingError) {
      console.error("Error fetching bookings:", bookingError);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const updatePagedBookings = (
    bookings: any[],
    page: number,
    perPage: number,
  ) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const pageItems = bookings.slice(startIndex, endIndex);
    setPagedBookings(pageItems);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    updatePagedBookings(allBookings, page, itemsPerPage);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    const total = Math.ceil(allBookings.length / value);
    setTotalPages(total);
    updatePagedBookings(allBookings, 1, value);
  };

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
        return "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  // CHỈ SỬA UI TỪ ĐÂY XUỐNG
  // GIỮ NGUYÊN TẤT CẢ LOGIC TRÊN

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64"></div>
              </div>
              <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2 text-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-10 bg-gray-100 dark:bg-gray-900 rounded"></div>
                      </div>
                    ))}
                  </div>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không thể tải thông tin người dùng
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vui lòng đăng nhập để xem trang hồ sơ.
          </p>
          <button
            onClick={() => refreshUser()}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic để hiển thị trang có trọng tâm
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return (
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>

        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Hiển thị{" "}
                <span className="font-medium">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    allBookings.length,
                  )}
                </span>{" "}
                -{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, allBookings.length)}
                </span>{" "}
                của <span className="font-medium">{allBookings.length}</span>{" "}
                kết quả
              </p>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Hiển thị:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <nav
              className="inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Đầu trang</span>
                <ChevronsLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang trước</span>
                <ChevronLeft className="h-4 w-4" />
              </button>

              {pages.map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      currentPage === page
                        ? "z-10 bg-gray-900 dark:bg-gray-700 border-gray-900 dark:border-gray-700 text-white"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang sau</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Cuối trang</span>
                <ChevronsRight className="h-4 w-4" />
              </button>
            </nav>

            <div className="ml-3 text-sm text-gray-600 dark:text-gray-400">
              Trang {currentPage} / {totalPages}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Hồ sơ cá nhân
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Thông tin tài khoản và lịch sử đặt phòng
              </p>
            </div>
            <button
              onClick={() => {
                refreshUser();
                fetchAllBookings();
              }}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 text-center">
                <div className="mb-4">
                  {userPhoto ? (
                    <img
                      src={`data:image/jpeg;base64,${userPhoto}`}
                      alt={userDetails?.displayName || "User"}
                      className="w-24 h-24 rounded-full border border-gray-300 dark:border-gray-600 object-cover mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xl font-medium mx-auto">
                              ${getInitials(userDetails?.displayName || "User")}
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xl font-medium mx-auto">
                      {getInitials(userDetails?.displayName || "User")}
                    </div>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {userDetails?.displayName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {userDetails?.jobTitle}
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mb-6">
                  {userDetails?.department} • {userDetails?.company}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {stats.totalBookings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Tổng
                    </div>
                  </div>
                  <div className="text-center p-3 border border-blue-200 dark:border-blue-800 rounded">
                    <div className="text-base font-medium text-blue-600 dark:text-blue-400">
                      {stats.upcomingBookings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Sắp tới
                    </div>
                  </div>
                  <div className="text-center p-3 border border-green-200 dark:border-green-800 rounded">
                    <div className="text-base font-medium text-green-600 dark:text-green-400">
                      {stats.completedBookings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Hoàn thành
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === "profile" ? "text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
                  >
                    Thông tin
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === "bookings" ? "text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
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
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Thông tin cá nhân
                  </h3>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Thông tin cơ bản */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        Họ và tên
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.displayName}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        Email
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.email}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" />
                        Chức vụ
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.jobTitle}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        Phòng ban
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.department}
                        </span>
                      </div>
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Building className="w-3 h-3" />
                        Công ty
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.company}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        Số điện thoại
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.phone}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        Vị trí
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.location}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Award className="w-3 h-3" />
                        Ngày vào làm
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.hireDate}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Languages className="w-3 h-3" />
                        Ngôn ngữ ưa thích
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
                          {userDetails?.preferredLanguage}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Loại người dùng
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white text-sm">
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
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Lịch sử đặt chỗ
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Hiển thị {itemsPerPage} booking mỗi trang
                      </p>
                    </div>
                    {allBookings.length > 0 && (
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Đã xác nhận
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Đang chờ
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Đã hủy
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {isLoadingBookings ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 border-2 border-gray-300 border-t-violet-600 dark:border-gray-700 dark:border-t-violet-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Đang tải danh sách đặt chỗ...
                      </p>
                    </div>
                  ) : allBookings.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                        Chưa có đặt chỗ nào
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        Bạn chưa đặt phòng họp nào trong hệ thống.
                      </p>
                      <a
                        href="/"
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-900 dark:bg-gray-800 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Đặt phòng ngay
                        <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {pagedBookings.map((booking) => (
                          <div
                            key={booking.ID}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                                  {booking.Title || "Không có tiêu đề"}
                                </h4>
                                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{formatDate(booking.StartTime)}</span>
                                    <span className="text-gray-400">•</span>
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span>
                                      {formatTime(booking.StartTime)} -{" "}
                                      {formatTime(booking.EndTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Home className="w-3.5 h-3.5 text-gray-400" />
                                    <span>
                                      {booking.MeetingRoom?.Value ||
                                        "Không xác định"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="sm:text-right">
                                <span
                                  className={`px-2.5 py-1 rounded text-xs font-medium ${getStatusColor(booking.Status?.Value)}`}
                                >
                                  {booking.Status?.Value || "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && renderPagination()}

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <div>
                            Tổng số{" "}
                            <span className="font-medium">
                              {stats.totalBookings}
                            </span>{" "}
                            booking
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              Sắp tới: {stats.upcomingBookings}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              Hoàn thành: {stats.completedBookings}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                              Hiển thị: {pagedBookings.length}/
                              {allBookings.length}
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
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Cần cập nhật thông tin? Vui lòng liên hệ bộ phận Nhân sự.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
