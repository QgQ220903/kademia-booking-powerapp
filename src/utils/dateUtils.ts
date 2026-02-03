import { BookingsService } from "../generated/services/BookingsService";

/**
 * Kiểm tra xem phòng có trống trong khoảng thời gian yêu cầu không
 * @param roomId ID của phòng
 * @param start Đối tượng Date bắt đầu
 * @param end Đối tượng Date kết thúc
 */
export const isRoomAvailable = async (
  roomId: number,
  start: Date,
  end: Date,
): Promise<boolean> => {
  try {
    // Lấy tất cả booking của phòng này mà chưa bị hủy
    // Lưu ý: Tùy vào API của bạn, có thể cần điều chỉnh filter này cho đúng cú pháp SharePoint
    const result = await BookingsService.getAll({
      select: ["StartTime", "EndTime", "Status", "MeetingRoom#Id"],
      // Chỉ lọc những booking của phòng hiện tại
    });

    if (!result.data || result.data.length === 0) return true;

    const reqStart = start.getTime();
    const reqEnd = end.getTime();

    // Thuật toán kiểm tra giao thoa (Overlap)
    const hasOverlap = result.data.some((booking: any) => {
      // Chỉ kiểm tra các booking thuộc đúng phòng này và không phải trạng thái 'Cancelled'
      if (
        booking["MeetingRoom#Id"] !== roomId ||
        booking.Status?.Value === "Cancelled"
      ) {
        return false;
      }

      const bStart = new Date(booking.StartTime).getTime();
      const bEnd = new Date(booking.EndTime).getTime();

      // Nếu (Bắt đầu A < Kết thúc B) và (Kết thúc A > Bắt đầu B) thì là TRÙNG
      return reqStart < bEnd && reqEnd > bStart;
    });

    return !hasOverlap;
  } catch (error) {
    console.error("Lỗi khi kiểm tra phòng trống:", error);
    return false; // Trả về false để an toàn (coi như phòng đang bận khi có lỗi)
  }
};
