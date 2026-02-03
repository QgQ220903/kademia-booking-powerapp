import { useState, useEffect } from "react";
import { MeetingRoomsService } from "../../generated/services/MeetingRoomsService";
import type { MeetingRooms } from "../../generated/models/MeetingRoomsModel";
import RoomForm from "./RoomForm";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Wifi,
  Tv,
  Projector,
  Phone,
  Users,
  RefreshCw,
  Building,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  AlertTriangle,
  Filter,
} from "lucide-react";

const RoomManagement = () => {
  const [rooms, setRooms] = useState<MeetingRooms[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRooms | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const result = await MeetingRoomsService.getAll({
        select: [
          "ID",
          "Title",
          "Capacity",
          "Location",
          "Equipment",
          "IsActive",
          "OData__ColorTag",
        ],
        orderBy: ["Title"],
      });

      if (result.data) {
        setRooms(result.data);
      } else {
        setError("Không có dữ liệu trả về");
      }
      setError(null);
    } catch (err: any) {
      setError(`Lỗi tải danh sách phòng: ${err.message}`);
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSave = async () => {
    await fetchRooms();
    setShowForm(false);
    setSelectedRoom(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    try {
      setDeleteLoading(id);
      await MeetingRoomsService.delete(id.toString());
      await fetchRooms();
    } catch (err: any) {
      alert(`Lỗi xóa phòng: ${err.message}`);
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleRoomStatus = async (room: MeetingRooms) => {
    try {
      await MeetingRoomsService.update(room.ID!.toString(), {
        IsActive: !room.IsActive,
      });
      await fetchRooms();
    } catch (err: any) {
      alert(`Lỗi cập nhật trạng thái: ${err.message}`);
    }
  };

  const renderEquipment = (equipment: any) => {
    let equipmentString = "";

    if (!equipment) {
      return (
        <div className="flex items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Không có
          </span>
        </div>
      );
    }

    if (equipment.Value) {
      equipmentString = equipment.Value;
    } else if (Array.isArray(equipment)) {
      const items = equipment
        .map((item) =>
          typeof item === "object" && item !== null ? item.Value : item,
        )
        .filter((val) => val);
      equipmentString = items.join(", ");
    } else if (typeof equipment === "string") {
      equipmentString = equipment;
    }

    if (!equipmentString || equipmentString.trim() === "") {
      return (
        <div className="flex items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Không có
          </span>
        </div>
      );
    }

    const equipmentList = equipmentString
      .split(",")
      .map((e: string) => e.trim())
      .filter((e) => e);

    if (equipmentList.length === 0) {
      return (
        <div className="flex items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Không có
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {equipmentList.slice(0, 2).map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            {getEquipmentIcon(item)}
            <span className="ml-1">{item}</span>
          </span>
        ))}
        {equipmentList.length > 2 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            +{equipmentList.length - 2}
          </span>
        )}
      </div>
    );
  };

  const getEquipmentIcon = (item: string) => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes("wifi") || itemLower.includes("wi-fi")) {
      return <Wifi className="w-3 h-3" />;
    }
    if (itemLower.includes("tv") || itemLower.includes("màn hình")) {
      return <Tv className="w-3 h-3" />;
    }
    if (itemLower.includes("projector") || itemLower.includes("máy chiếu")) {
      return <Projector className="w-3 h-3" />;
    }
    if (itemLower.includes("phone") || itemLower.includes("điện thoại")) {
      return <Phone className="w-3 h-3" />;
    }
    return null;
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.Location?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "active") return room.IsActive;
    if (statusFilter === "inactive") return !room.IsActive;

    return true;
  });

  const activeRooms = rooms.filter((r) => r.IsActive).length;
  const inactiveRooms = rooms.filter((r) => !r.IsActive).length;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>

        {/* Skeleton Table */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 p-4">
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, j) => (
                  <div
                    key={j}
                    className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Danh sách phòng họp
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Quản lý và cấu hình tất cả phòng họp trong hệ thống
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={fetchRooms}
            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </button>
          <button
            onClick={() => {
              setSelectedRoom(null);
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm phòng mới
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng số phòng
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                {rooms.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đang hoạt động
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                {activeRooms}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ngừng hoạt động
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                {inactiveRooms}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng họp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tên phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sức chứa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thiết bị
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="text-gray-400 dark:text-gray-500">
                      <Building className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Không tìm thấy phòng nào
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {searchTerm || statusFilter !== "all"
                          ? "Thử thay đổi bộ lọc tìm kiếm"
                          : "Thêm phòng đầu tiên"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr
                    key={room.ID}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                          style={{
                            backgroundColor:
                              room.OData__ColorTag ||
                              (room.IsActive ? "#10b981" : "#9ca3af"),
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-100">
                            {room.Title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                            ID: {room.ID}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-100">
                          {room.Capacity || "Không giới hạn"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-100">
                        {room.Location || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renderEquipment(room.Equipment)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRoomStatus(room)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          room.IsActive
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        }`}
                      >
                        {room.IsActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                            Hoạt động
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1.5" />
                            Ngừng
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowForm(true);
                          }}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => room.ID && handleDelete(room.ID)}
                          disabled={deleteLoading === room.ID}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa"
                        >
                          {deleteLoading === room.ID ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Hiển thị{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {filteredRooms.length}
          </span>
          /{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {rooms.length}
          </span>{" "}
          phòng
        </p>
        <div className="flex items-center space-x-4">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Xóa tìm kiếm
            </button>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Cập nhật:{" "}
            {new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Room Form Modal */}
      {showForm && (
        <RoomForm
          room={selectedRoom}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
};

export default RoomManagement;
