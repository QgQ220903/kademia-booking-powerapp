import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookingsService } from "../../generated/services/BookingsService";
import { useUser } from "../../contexts/UserContext";
import { isRoomAvailable } from "../../utils/bookingLogic";
import { Office365OutlookService } from "../../generated";
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
  Users,
  Building,
  Briefcase,
  ShieldCheck,
  MapPin,
  Hash,
  User,
  Clock3,
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
      await sendBookingConfirmationEmail({
        title: formData.Title,
        roomName: roomName || "Meeting Room",
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        description: formData.Description,
        bookedBy: user?.displayName || "Khách",
        bookedByEmail: user?.mail || "",
      });

      alert("✅ Đặt chỗ thành công! Email xác nhận đã được gửi.");
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
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.round(hours * 10) / 10;
  };

  const getDurationText = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} phút`;
    } else if (hours === 1) {
      return "1 giờ";
    } else if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days} ngày ${remainingHours > 0 ? `+ ${remainingHours} giờ` : ""}`;
    } else {
      return `${hours} giờ`;
    }
  };

  const sendBookingConfirmationEmail = async (bookingDetails: {
    title: string;
    roomName: string;
    startTime: string;
    endTime: string;
    description: string;
    bookedBy: string;
    bookedByEmail: string;
  }) => {
    try {
      const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const emailBody = `
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .booking-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .info-row { margin: 15px 0; }
            .label { font-weight: bold; color: #667eea; display: inline-block; width: 150px; }
            .value { color: #333; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">✅</div>
              <h1>XÁC NHẬN ĐẶT PHÒNG THÀNH CÔNG</h1>
              <p style="margin: 10px 0 0 0;">Kademia Meeting Room Booking System</p>
            </div>
            
            <div class="content">
              <p>Xin chào <strong>${bookingDetails.bookedBy}</strong>,</p>
              
              <p>Đặt phòng họp của bạn đã được xác nhận thành công. Dưới đây là thông tin chi tiết:</p>
              
              <div class="booking-card">
                <h2 style="color: #667eea; margin-top: 0;">📋 THÔNG TIN CUỘC HỌP</h2>
                
                <div class="info-row">
                  <span class="label">🎯 Tiêu đề:</span>
                  <span class="value">${bookingDetails.title}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">🏢 Phòng họp:</span>
                  <span class="value">${bookingDetails.roomName}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">📅 Bắt đầu:</span>
                  <span class="value">${formatDateTime(bookingDetails.startTime)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">🕐 Kết thúc:</span>
                  <span class="value">${formatDateTime(bookingDetails.endTime)}</span>
                </div>
                
                ${
                  bookingDetails.description
                    ? `
                <div class="info-row" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                  <span class="label">📝 Mô tả:</span>
                  <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${bookingDetails.description}</div>
                </div>
                `
                    : ""
                }
              </div>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Vui lòng đến đúng giờ hoặc sớm 5-10 phút để chuẩn bị</li>
                  <li>Nếu không thể tham dự, vui lòng hủy đặt phòng trên hệ thống</li>
                  <li>Giữ gìn vệ sinh và tắt đèn, điều hòa sau khi sử dụng</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="https://your-app-url.com/my-bookings" class="button">
                  Xem lịch đặt phòng của tôi
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Kademia Meeting Room Booking System</strong></p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>Nếu cần hỗ trợ, liên hệ: <a href="mailto:[email protected]">admin@kademia</a></p>
              <p style="margin-top: 15px; color: #999;">© 2024 Kademia. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

      await Office365OutlookService.SendEmailV2({
        To: bookingDetails.bookedByEmail,
        Subject: `✅ Xác nhận đặt phòng: ${bookingDetails.title} - ${bookingDetails.roomName}`,
        Body: emailBody,
        Importance: "High",
      });

      console.log("✅ Email xác nhận đã được gửi thành công");
    } catch (emailError) {
      console.error("❌ Lỗi khi gửi email xác nhận:", emailError);
      // Không throw error để không ảnh hưởng đến flow booking
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section - Điều chỉnh font size */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Quay lại</span>
                </button>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Đặt phòng họp
                </h1>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
                <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/30">
                  {roomName}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Điền thông tin để đặt phòng cho cuộc họp của bạn
              </p>
            </div>

            {/* User Info - Desktop */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center">
                <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                  {user?.mail}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              {/* Form Header - Điều chỉnh font size */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      Thông tin đặt phòng
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-500">
                      Vui lòng điền đầy đủ thông tin bên dưới
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      Tiêu đề cuộc họp
                      <span className="text-rose-500 text-sm">*</span>
                    </label>
                    <input
                      type="text"
                      name="Title"
                      className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Ví dụ: Họp team định kỳ, Kick-off dự án..."
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* DateTime Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        Thời gian bắt đầu
                        <span className="text-rose-500 text-sm">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="StartTime"
                        className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all [color-scheme:light] dark:[color-scheme:dark]"
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        Thời gian kết thúc
                        <span className="text-rose-500 text-sm">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="EndTime"
                        className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all [color-scheme:light] dark:[color-scheme:dark]"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Duration Preview */}
                  {(formData.StartTime || formData.EndTime) && (
                    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center">
                            <Clock3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                              Thời lượng cuộc họp
                            </h4>
                            <p className="text-lg font-bold text-violet-700 dark:text-violet-400">
                              {getDurationText(calculateDuration())}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 dark:text-gray-500 mb-1">
                            Thời gian
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDateTime(formData.StartTime)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            đến {formatDateTime(formData.EndTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description Field */}
                  <div>
                    <label className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      Mô tả chi tiết
                    </label>
                    <textarea
                      name="Description"
                      rows={4}
                      className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                      placeholder="Mô tả chi tiết về cuộc họp, thành phần tham dự, yêu cầu đặc biệt..."
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Không bắt buộc, nhưng nên có để các thành viên khác hiểu
                      rõ mục đích cuộc họp
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-gradient-to-r from-rose-50 to-white dark:from-rose-900/20 dark:to-gray-800 border border-rose-200 dark:border-rose-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 flex items-center justify-center">
                          <X className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                            Không thể đặt phòng
                          </h4>
                          <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 px-5 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 flex items-center justify-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
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
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Room Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Thông tin phòng
                  </h3>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center">
                    <Home className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                      Tên phòng
                    </label>
                    <div className="p-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {roomName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                      Mã phòng
                    </label>
                    <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800/30 rounded-xl">
                      <Hash className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 mr-1.5" />
                      <span className="text-sm font-bold text-violet-700 dark:text-violet-400">
                        #{roomId}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      Thông tin người đặt
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                          {user?.displayName?.charAt(0) || "U"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <ShieldCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {user?.displayName || "Khách"}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-500 mt-0.5">
                          {user?.mail || "Chưa đăng nhập"}
                        </p>
                        <div className="mt-1.5">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium">
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
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Lưu ý khi đặt phòng
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      Kiểm tra trùng lịch
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-500 mt-0.5">
                      Hệ thống sẽ tự động kiểm tra lịch trùng
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      Đến sớm 5-10 phút
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-500 mt-0.5">
                      Để chuẩn bị và kết nối thiết bị
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      Vệ sinh sau khi sử dụng
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-500 mt-0.5">
                      Giữ gìn vệ sinh chung cho người sau
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      Hủy đặt nếu không dùng
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-500 mt-0.5">
                      Giúp người khác có thể sử dụng phòng
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Cần hỗ trợ?
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">
                    Liên hệ bộ phận Hành chính văn phòng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs text-gray-600 dark:text-gray-500">
                <span className="font-medium text-gray-900 dark:text-white">
                  Kademia Booking
                </span>{" "}
                • Hệ thống đặt phòng nội bộ
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-1"></div>
                  <span>Phiên bản 1.0</span>
                </div>
                <span>•</span>
                <span>Dành riêng cho nhân viên Kademia</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Đặt phòng thành công sẽ được gửi xác nhận qua email
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
