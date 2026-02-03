import { BookingsService } from "../generated/services/BookingsService";

export const isRoomAvailable = async (
  roomId: number,
  start: Date,
  end: Date,
): Promise<boolean> => {
  try {
    // Lấy dữ liệu và không giới hạn select quá mức để tránh mất field ID
    const result = await BookingsService.getAll({
      select: ["ID", "StartTime", "EndTime", "Status", "MeetingRoom"],
    });

    if (!result.data || result.data.length === 0) return true;

    const reqStart = start.getTime();
    const reqEnd = end.getTime();

    const hasOverlap = result.data.some((booking: any) => {
      // CHIẾN THUẬT TRUY QUÉT ID PHÒNG:
      // Thử mọi cách mà SharePoint có thể trả về ID của trường Lookup
      const bRoomId =
        (booking.MeetingRoom && typeof booking.MeetingRoom === "object"
          ? booking.MeetingRoom.Id
          : null) ||
        booking["MeetingRoom#Id"] ||
        booking.MeetingRoomId;

      // Log để debug (Bạn có thể xóa sau khi chạy tốt)
      console.log(`Checking Booking ${booking.ID}: RoomID found = ${bRoomId}`);

      const isSameRoom = Number(bRoomId) === Number(roomId);
      const isNotCancelled = booking.Status?.Value !== "Cancelled";

      if (isSameRoom && isNotCancelled) {
        const bStart = new Date(booking.StartTime).getTime();
        const bEnd = new Date(booking.EndTime).getTime();

        // Thuật toán giao thoa (Overlap)
        return reqStart < bEnd && reqEnd > bStart;
      }
      return false;
    });

    return !hasOverlap;
  } catch (error) {
    console.error("Lỗi kiểm tra trùng:", error);
    return false;
  }
};
