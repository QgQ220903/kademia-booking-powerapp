import React from "react";
import { useUser } from "../contexts/UserContext";
import { Office365UsersService } from "../generated/services/Office365UsersService";
import { useState, useEffect } from "react";

const UserProfile: React.FC = () => {
  // GIỮ NGUYÊN TẤT CẢ LOGIC
  const { user, loading, error } = useUser();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (user?.mail) {
        setPhotoLoading(true);
        try {
          const result = await Office365UsersService.UserPhoto_V2(user.mail);
          if (result.data) {
            setUserPhoto(result.data);
          }
        } catch (err) {
          console.error("Failed to fetch user photo:", err);
        } finally {
          setPhotoLoading(false);
        }
      }
    };

    fetchUserPhoto();
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="hidden lg:block space-y-1.5">
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-2.5 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
        <svg
          className="w-4 h-4 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-medium text-red-700 dark:text-red-400 ml-1.5">
          Lỗi tải thông tin
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Profile menu"
      >
        {/* Avatar */}
        <div className="relative">
          {photoLoading ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ) : userPhoto ? (
            <img
              src={`data:image/jpeg;base64,${userPhoto}`}
              alt={user.displayName || "User"}
              className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}

          {(!userPhoto || photoLoading) && (
            <div
              className={`w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium text-sm ${userPhoto ? "hidden" : ""}`}
            >
              {getInitials(user.displayName || "User")}
            </div>
          )}

          {/* Online status indicator - simplified */}
          <div className="absolute -bottom-0.5 -right-0.5">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
          </div>
        </div>

        {/* User info - visible on larger screens */}
        <div className="hidden lg:block text-left">
          <div className="flex items-center">
            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate max-w-[140px]">
              {user.displayName}
            </p>
            <svg
              className={`w-3.5 h-3.5 ml-1 text-gray-500 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[160px]">
            {user.mail}
          </p>
        </div>

        {/* Arrow for mobile */}
        <div className="lg:hidden">
          <svg
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {showProfileMenu && (
        <>
          <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md py-1.5 z-50">
            {/* Header with user info */}
            <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {userPhoto ? (
                    <img
                      src={`data:image/jpeg;base64,${userPhoto}`}
                      alt={user.displayName || "User"}
                      className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium">
                      {getInitials(user.displayName || "User")}
                    </div>
                  )}

                  <div className="absolute -bottom-0.5 -right-0.5">
                    <div className="w-3 h-3 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {user.mail}
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {[
                {
                  href: "/profile",
                  icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                  label: "Hồ sơ của tôi",
                  desc: "Thông tin cá nhân",
                },
                {
                  href: "/my-bookings",
                  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                  label: "Đặt chỗ của tôi",
                  desc: "Lịch đặt phòng họp",
                },
                {
                  href: "/settings",
                  icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
                  label: "Cài đặt",
                  desc: "Tùy chỉnh tài khoản",
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded flex items-center justify-center mr-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                      {item.desc}
                    </p>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              ))}

              <div className="border-t border-gray-100 dark:border-gray-700 my-1.5"></div>

              <button
                onClick={() => {
                  console.log("Đăng xuất");
                  setShowProfileMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="w-7 h-7 rounded flex items-center justify-center mr-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-red-700 dark:text-red-400 text-sm">
                    Đăng xuất
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500/80">
                    Kết thúc phiên làm việc
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Click outside để đóng menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileMenu(false)}
          />
        </>
      )}
    </div>
  );
};

export default UserProfile;
