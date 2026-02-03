import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookingsService } from "../generated/services/BookingsService";
import { useUser } from "../contexts/UserContext";
import { isRoomAvailable } from "../utils/bookingLogic";
import {
  Calendar,
  Clock,
  FileText,
  Home,
  AlertCircle,
  X,
  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const BookingForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const roomName = searchParams.get("roomName");
  const navigate = useNavigate();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    Title: "",
    StartTime: "",
    EndTime: "",
    Description: "",
    meetingRoomId: roomId ? parseInt(roomId, 10) : 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const startDate = new Date(formData.StartTime);
    const endDate = new Date(formData.EndTime);

    if (endDate <= startDate) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    setSubmitting(true);

    try {
      const available = await isRoomAvailable(
        Number(formData.meetingRoomId),
        startDate,
        endDate,
      );

      if (!available) {
        setError("Phòng đã có người đặt trong khung giờ này.");
        setSubmitting(false);
        return;
      }

      const bookingData: any = {
        Title: formData.Title,
        MeetingRoom: {
          "@odata.type": "#Microsoft.PowerApps.LookupValue",
          Id: formData.meetingRoomId,
          Value: roomName || "Meeting Room",
        },
        StartTime: startDate.toISOString(),
        EndTime: endDate.toISOString(),
        Status: {
          "@odata.type": "#Microsoft.PowerApps.ChecklistValue",
          Value: "Confirmed",
          Id: 1,
        },
        BookedBy: {
          "@odata.type": "#Microsoft.PowerApps.UserValue",
          Claims: `i:0#.f|membership|${user?.mail}`,
          DisplayName: user?.displayName || "",
          Email: user?.mail || "",
          Picture: "",
          Department: "",
          JobTitle: "",
        },
        Description: formData.Description || "",
      };

      const result = await BookingsService.create(bookingData);

      if (result && result.error) {
        throw new Error(result.error.message || "Lỗi từ SharePoint");
      }

      alert("✅ Đặt chỗ thành công!");
      navigate("/my-bookings");
    } catch (err: any) {
      console.error("Chi tiết lỗi API:", err);
      setError("Không thể đặt phòng: " + (err.message || "Lỗi kết nối"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const calculateDuration = () => {
    if (!formData.StartTime || !formData.EndTime) return 0;
    const start = new Date(formData.StartTime);
    const end = new Date(formData.EndTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-8xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:px-16">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-8">
                {/* Form Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Đặt phòng họp
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Vui lòng điền đầy đủ thông tin bên dưới
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FileText className="inline w-4 h-4 mr-2" />
                      Tiêu đề cuộc họp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Title"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
                      placeholder="Ví dụ: Họp team định kỳ, Kick-off dự án..."
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* DateTime Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        Bắt đầu <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="StartTime"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Clock className="inline w-4 h-4 mr-2" />
                        Kết thúc <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="EndTime"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Duration Preview */}
                  {(formData.StartTime || formData.EndTime) && (
                    <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800/30">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tổng thời lượng:
                          </p>
                          <p className="text-lg font-bold text-violet-700 dark:text-violet-400">
                            {calculateDuration()} giờ
                          </p>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="font-medium">
                            {formatDateTime(formData.StartTime)}
                          </div>
                          <div className="text-xs">
                            đến {formatDateTime(formData.EndTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FileText className="inline w-4 h-4 mr-2" />
                      Mô tả chi tiết
                    </label>
                    <textarea
                      name="Description"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors resize-none"
                      placeholder="Mô tả chi tiết về cuộc họp, thành phần tham dự, yêu cầu đặc biệt..."
                      onChange={handleChange}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                            <X className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                            Không thể đặt phòng
                          </h4>
                          <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                      >
                        <div className="flex items-center justify-center">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Quay lại
                        </div>
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-center">
                          {submitting ? (
                            <>
                              <Loader2 className="animate-spin w-4 h-4 mr-2" />
                              <span>Đang xử lý...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              <span>Xác nhận đặt phòng</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Room & User Info */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-6">
              {/* Room Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Thông tin phòng
                    </h3>
                    <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Tên phòng
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {roomName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Mã phòng
                      </p>
                      <div className="inline-flex items-center px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 rounded border border-violet-100 dark:border-violet-800/30">
                        <span className="text-sm font-medium text-violet-700 dark:text-violet-400">
                          #{roomId}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Đặt phòng cho:
                      </h4>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {user?.displayName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {user?.displayName || "Khách"}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {user?.mail || "Chưa đăng nhập"}
                          </p>
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full">
                              Người đặt chính
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-violet-500" />
                  Lưu ý khi đặt phòng
                </h4>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-2 mt-1">•</span>
                    <span>Kiểm tra trùng lịch trước khi đặt</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-2 mt-1">•</span>
                    <span>Đến sớm 5-10 phút trước giờ họp</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-2 mt-1">•</span>
                    <span>Vệ sinh sau khi sử dụng</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-violet-500 mr-2 mt-1">•</span>
                    <span>Hủy đặt nếu không sử dụng</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
