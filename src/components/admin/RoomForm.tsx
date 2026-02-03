import { useState, useEffect } from "react";
import { MeetingRoomsService } from "../../generated/services/MeetingRoomsService";
import type { MeetingRooms } from "../../generated/models/MeetingRoomsModel";
import { X, Loader2 } from "lucide-react";

interface RoomFormProps {
  room: MeetingRooms | null;
  onSave: () => void;
  onClose: () => void;
}

const RoomForm = ({ room, onSave, onClose }: RoomFormProps) => {
  const isEditMode = !!room;

  const [formData, setFormData] = useState({
    Title: "",
    Capacity: 10,
    Location: "",
    EquipmentValue: "",
    IsActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm chuyển đổi từ định dạng mảng SharePoint sang chuỗi hiển thị
  const formatEquipmentForDisplay = (equipmentData: any): string => {
    if (!equipmentData) return "";

    console.log("Raw equipment data for display:", equipmentData);

    // Nếu là mảng rỗng
    if (Array.isArray(equipmentData) && equipmentData.length === 0) {
      return "";
    }

    // Nếu là mảng object theo định dạng SharePoint
    if (Array.isArray(equipmentData)) {
      return equipmentData
        .map((item) => {
          // Xử lý cả hai định dạng: có thể là {Value: "...", Id: ...} hoặc chỉ string
          if (typeof item === "string") {
            return item;
          } else if (item && typeof item === "object" && "Value" in item) {
            return item.Value;
          }
          return "";
        })
        .filter((value) => value && value.trim().length > 0)
        .join(", ");
    }

    // Nếu là chuỗi
    if (typeof equipmentData === "string") {
      return equipmentData.split(";#").filter(Boolean).join(", ");
    }

    return "";
  };

  // Pre-fill form for edit mode
  useEffect(() => {
    if (room) {
      // Xử lý Equipment từ model về chuỗi hiển thị
      let equipmentValue = formatEquipmentForDisplay(room.Equipment);

      setFormData({
        Title: room.Title || "",
        Capacity: room.Capacity || 10,
        Location: room.Location || "",
        EquipmentValue: equipmentValue,
        IsActive: room.IsActive ?? true,
      });

      console.log("Editing room - Equipment data:", {
        original: room.Equipment,
        formatted: equipmentValue,
      });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Chuẩn bị dữ liệu gửi lên SharePoint
      const submitData: any = {
        Title: formData.Title.trim(),
        Capacity: formData.Capacity,
        IsActive: formData.IsActive,
      };

      // Thêm Location nếu có
      if (formData.Location.trim()) {
        submitData.Location = formData.Location.trim();
      }

      // 🔥 PHẦN QUAN TRỌNG: XỬ LÝ MULTIPLE CHOICE THEO ĐỊNH DẠNG MẢNG CHÍNH XÁC
      if (formData.EquipmentValue.trim()) {
        // Tách chuỗi thành mảng các giá trị
        const choicesArray = formData.EquipmentValue.split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        console.log("Choices array:", choicesArray);

        // 🔥 TẠO MẢNG OBJECT THEO CHUẨN SHAREPOINT CHO MULTIPLE CHOICE
        // Định dạng: [{ "@odata.type": "...", "Value": "...", "Id": 0 }, ...]
        const equipmentArray = choicesArray.map((choice) => ({
          "@odata.type":
            "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedReference",
          Value: choice,
          // Sử dụng Id: 0 cho các giá trị mới tạo
          // Khi update, có thể cần lấy Id từ dữ liệu gốc nếu có
          Id: 0,
        }));

        // Gán theo định dạng mảng object
        submitData.Equipment = equipmentArray;

        // KHÔNG GỬI "Equipment#Id" và "Equipment@odata.type" để tránh lỗi trước đó
        console.log(
          "Equipment value (ARRAY format for SharePoint):",
          submitData.Equipment,
        );
      } else {
        // Nếu không có thiết bị, gửi mảng rỗng
        submitData.Equipment = [];
      }

      console.log("Full submit data:", submitData);

      if (isEditMode && room?.ID) {
        // Xử lý đặc biệt cho update: cố gắng giữ Id của giá trị cũ nếu có
        if (Array.isArray(room.Equipment) && formData.EquipmentValue.trim()) {
          const existingChoices = room.Equipment || [];
          const newChoices = formData.EquipmentValue.split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

          // Tạo mảng mới với Id đúng (nếu có)
          const updatedEquipmentArray = newChoices.map((choice) => {
            const existing = existingChoices.find(
              (item) =>
                item.Value === choice ||
                (typeof item === "object" && item.Value === choice),
            );
            return {
              "@odata.type":
                "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedReference",
              Value: choice,
              Id: existing?.Id || 0,
            };
          });

          submitData.Equipment = updatedEquipmentArray;
        }

        const result = await MeetingRoomsService.update(
          room.ID.toString(),
          submitData as any,
        );
        console.log("Update result:", result);

        if (result.error) {
          throw new Error(result.error.message || "Lỗi cập nhật phòng");
        }

        if (!result.data) {
          throw new Error("Không nhận được dữ liệu phản hồi từ server");
        }
      } else {
        // Tạo mới
        const result = await MeetingRoomsService.create(submitData as any);
        console.log("Create result:", result);

        if (result.error) {
          throw new Error(result.error.message || "Lỗi tạo phòng mới");
        }

        if (!result.data) {
          throw new Error("Không nhận được dữ liệu phản hồi từ server");
        }
      }

      // Thành công
      onSave();
    } catch (err: any) {
      console.error("Save room error:", err);

      // Hiển thị lỗi chi tiết
      let errorMsg = "Lỗi không xác định";

      if (err.message) {
        errorMsg = err.message;
      } else if (err.data?.message) {
        errorMsg = err.data.message;
      } else if (typeof err === "string") {
        errorMsg = err;
      }

      // Cố gắng trích xuất thông báo lỗi từ chuỗi JSON
      try {
        if (err.message && err.message.includes("{")) {
          const errorMatch = err.message.match(/\{[^}]+\}/);
          if (errorMatch) {
            const errorJson = JSON.parse(errorMatch[0]);
            errorMsg = errorJson.message || errorMsg;
          }
        }
      } catch (parseErr) {
        // Nếu không parse được, giữ nguyên thông báo
      }

      setError(`Lỗi ${isEditMode ? "cập nhật" : "tạo"} phòng: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const equipmentOptions = [
    "Máy chiếu",
    "Webcam",
    "Hệ thống âm thanh",
    "Bảng trắng",
    "Micro không dây",
    "Máy chiếu 4k",
    "Sticky notes",
    "Bàn làm việc linh hoạt",
    "TV",
    "Hệ thống hội nghị truyền hình",
    "Bàn gỗ cao cấp",
    "Máy tính trainer",
    "Ấm trà",
    "Tủ lạnh mini",
  ];

  const handleEquipmentClick = (item: string) => {
    const current = formData.EquipmentValue.split(",")
      .map((e) => e.trim())
      .filter((e) => e);

    if (current.includes(item)) {
      // Remove item
      setFormData({
        ...formData,
        EquipmentValue: current.filter((e) => e !== item).join(", "),
      });
    } else {
      // Add item
      setFormData({
        ...formData,
        EquipmentValue: [...current, item].join(", "),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? "Chỉnh sửa Phòng" : "Thêm Phòng Mới"}
            </h3>
            {isEditMode && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ID: {room.ID}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-red-500" />
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                    Có lỗi xảy ra
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Room Name - REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.Title}
                onChange={(e) =>
                  setFormData({ ...formData, Title: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors"
                placeholder="VD: Phòng họp A1, Hội trường tầng 3..."
                disabled={loading}
              />
            </div>

            {/* Capacity - REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sức chứa (người) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="200"
                required
                value={formData.Capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Capacity: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tối thiểu: 1 người • Tối đa: 200 người
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vị trí
              </label>
              <input
                type="text"
                value={formData.Location}
                onChange={(e) =>
                  setFormData({ ...formData, Location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors"
                placeholder="VD: Tầng 5, Tòa nhà A"
                disabled={loading}
              />
            </div>

            {/* Equipment - Multiple Choice Column */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Thiết bị có sẵn (Có thể chọn nhiều)
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (
                  {
                    formData.EquipmentValue.split(",").filter((e) => e.trim())
                      .length
                  }{" "}
                  đã chọn)
                </span>
              </label>

              {/* Selected Equipment Preview */}
              {formData.EquipmentValue && (
                <div className="mb-4 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                      Thiết bị đã chọn:
                    </p>
                    {formData.EquipmentValue.split(",").filter((e) => e.trim())
                      .length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, EquipmentValue: "" })
                        }
                        className="text-xs text-violet-500 hover:text-violet-700 dark:hover:text-violet-400"
                        disabled={loading}
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.EquipmentValue.split(",").map(
                      (item, index) =>
                        item.trim() && (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm flex items-center"
                          >
                            {item.trim()}
                            <button
                              type="button"
                              onClick={() => {
                                const items = formData.EquipmentValue.split(",")
                                  .map((e) => e.trim())
                                  .filter((e) => e);
                                setFormData({
                                  ...formData,
                                  EquipmentValue: items
                                    .filter((e) => e !== item.trim())
                                    .join(", "),
                                });
                              }}
                              className="ml-2 text-violet-500 hover:text-violet-700 dark:hover:text-violet-400"
                              disabled={loading}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ),
                    )}
                  </div>
                </div>
              )}

              {/* Equipment Options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {equipmentOptions.map((item) => {
                  const isSelected = formData.EquipmentValue.split(",")
                    .map((e) => e.trim())
                    .includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleEquipmentClick(item)}
                      className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                        isSelected
                          ? "bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                          : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={loading}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Manual Input */}
              <div className="mt-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Hoặc nhập thủ công (cách nhau bằng dấu phẩy):
                </label>
                <input
                  type="text"
                  value={formData.EquipmentValue}
                  onChange={(e) =>
                    setFormData({ ...formData, EquipmentValue: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500 focus:border-transparent outline-none transition-colors text-sm"
                  placeholder="Máy chiếu, Webcam, Hệ thống âm thanh"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Sử dụng đúng tên thiết bị từ danh sách trên để đảm bảo đồng bộ
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.IsActive}
                  onChange={(e) =>
                    setFormData({ ...formData, IsActive: e.target.checked })
                  }
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                  disabled={loading}
                />
                <label
                  htmlFor="isActive"
                  className="ml-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="font-medium">Phòng đang hoạt động</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Phòng không hoạt động sẽ không thể được đặt
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Đang xử lý...
                </>
              ) : isEditMode ? (
                "Cập nhật phòng"
              ) : (
                "Tạo phòng mới"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
