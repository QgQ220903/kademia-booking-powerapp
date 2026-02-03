import { Calendar } from "lucide-react";

// File: src/components/admin/BookingOverview.tsx (tạm thời)
const BookingOverview = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Tất cả Booking
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Chức năng đang được phát triển. Sẽ hiển thị tất cả booking của công ty.
      </p>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">
          Component "Booking Overview" đang được xây dựng
        </p>
      </div>
    </div>
  );
};

export default BookingOverview;
