import { Link, useLocation } from "react-router-dom";
import UserProfile from "../UserProfile";
import { useTheme } from "../../contexts/ThemeContext";
import { useState } from "react";
import { useUser } from "../../contexts/UserContext";
// Import ảnh logo trực tiếp
import logoLight from "../../assets/logo-light.png";
import logoDark from "../../assets/logo-dark.png";

// Import Lucide icons
import {
  Home,
  CalendarDays,
  UserCircle,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  BriefcaseBusiness,
  Building,
  Shield,
  Bell,
  HelpCircle,
} from "lucide-react";

const useActiveLink = (path: string) => {
  const location = useLocation();
  return location.pathname === path;
};

const NavItem = ({
  to,
  children,
  icon,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  const isActive = useActiveLink(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center px-3 py-2.5 rounded-lg 
        transition-all duration-200 text-sm font-medium
        ${
          isActive
            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20"
            : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-900 hover:text-violet-600 dark:hover:text-violet-400"
        }
      `}
    >
      {icon && (
        <span
          className={`mr-2.5 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`}
        >
          {icon}
        </span>
      )}
      {children}
    </Link>
  );
};

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useUser();
  // Sử dụng ảnh đã import
  const logoPath = theme === "light" ? logoLight : logoDark;

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.currentTarget;
    target.style.display = "none";

    const fallbackDiv = document.createElement("div");
    fallbackDiv.className =
      "w-full h-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center rounded-xl";
    fallbackDiv.innerHTML = `
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    `;
    target.parentElement?.appendChild(fallbackDiv);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand & Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative w-9 h-9 flex items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800">
                  <img
                    key={theme}
                    src={logoPath}
                    alt="Kademia Logo"
                    className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
                    onError={handleImageError}
                  />
                </div>
                <div className="hidden md:block">
                  <div className="flex items-baseline gap-2">
                    <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                      Kademia
                    </h1>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                      Booking
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wider font-medium mt-0.5">
                    Hệ thống đặt phòng nội bộ
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavItem to="/" icon={<Home className="w-4 h-4" />}>
                Phòng họp
              </NavItem>
              <NavItem
                to="/my-bookings"
                icon={<CalendarDays className="w-4 h-4" />}
              >
                Lịch của tôi
              </NavItem>
              <NavItem to="/profile" icon={<UserCircle className="w-4 h-4" />}>
                Thông tin
              </NavItem>
              {/* Thêm link Quản trị - Chỉ hiện cho Admin */}
              {isAdmin && (
                <NavItem to="/admin" icon={<Shield className="w-4 h-4" />}>
                  Quản trị
                </NavItem>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <button
                className="hidden sm:flex p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
                aria-label="Thông báo"
              >
                <Bell className="w-4.5 h-4.5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></div>
                <div className="absolute top-full right-0 mt-2 w-64 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Thông báo
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Không có thông báo mới
                  </p>
                </div>
              </button>

              {/* Help */}
              <button
                className="hidden sm:flex p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Trợ giúp"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Dark Mode"
                className="hidden sm:flex items-center p-2 rounded-lg bg-gradient-to-r from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gradient-to-r from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-400 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* User Profile */}
              <div className="relative">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`lg:hidden fixed top-16 right-0 z-50 w-80 h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-l border-gray-200/50 dark:border-gray-800/50 transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 space-y-4 h-full flex flex-col">
          {/* User Info Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800">
                <img
                  key={`mobile-${theme}`}
                  src={logoPath}
                  alt="Kademia Logo"
                  className="w-9 h-9 object-contain"
                  onError={handleImageError}
                />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Kademia
                  </p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                    Booking
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Hệ thống đặt phòng nội bộ
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-600 dark:text-gray-500">
                <BriefcaseBusiness className="w-3.5 h-3.5 mr-1.5" />
                <span>Company Internal</span>
              </div>
              <span className="px-2 py-1 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 text-violet-700 dark:text-violet-400 rounded-lg text-xs font-medium">
                v1.0
              </span>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-1 flex-1">
            <NavItem
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<Home className="w-4.5 h-4.5" />}
            >
              Phòng họp
            </NavItem>

            <NavItem
              to="/my-bookings"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<CalendarDays className="w-4.5 h-4.5" />}
            >
              Lịch của tôi
            </NavItem>

            <NavItem
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<UserCircle className="w-4.5 h-4.5" />}
            >
              Thông tin cá nhân
            </NavItem>

            {/* Thêm link Quản trị cho Mobile - Chỉ hiện cho Admin */}
            {isAdmin && (
              <NavItem
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                icon={<Shield className="w-4.5 h-4.5" />}
              >
                Quản trị hệ thống
              </NavItem>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>

          {/* Mobile Settings Section */}
          <div className="space-y-1">
            {/* Mobile Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200"
            >
              <div className="flex items-center">
                {theme === "light" ? (
                  <>
                    <Moon className="w-4.5 h-4.5 mr-3" />
                    <div>
                      <span className="font-medium text-sm block">
                        Dark Mode
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Chuyển sang giao diện tối
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Sun className="w-4.5 h-4.5 mr-3" />
                    <div>
                      <span className="font-medium text-sm block">
                        Light Mode
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Chuyển sang giao diện sáng
                      </span>
                    </div>
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Help & Support */}
            <button
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <HelpCircle className="w-4.5 h-4.5 mr-3" />
                <div>
                  <span className="font-medium text-sm block">Trợ giúp</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    Hướng dẫn sử dụng
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Company Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 py-1">
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-500 mb-2">
                <Building className="w-3.5 h-3.5 mr-1.5" />
                <span className="font-medium">Kademia Company</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-500">
                Dành riêng cho nhân viên nội bộ • Phiên bản enterprise
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
