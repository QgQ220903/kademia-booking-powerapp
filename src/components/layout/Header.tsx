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
        flex items-center px-3 py-2 rounded 
        transition-colors text-sm font-medium
        ${
          isActive
            ? "bg-violet-600 text-white shadow-sm"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-violet-600 dark:hover:text-violet-400"
        }
      `}
    >
      {icon && (
        <span
          className={`mr-2 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`}
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
      "w-full h-full bg-violet-600 flex items-center justify-center rounded";
    fallbackDiv.innerHTML = `
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    `;
    target.parentElement?.appendChild(fallbackDiv);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Brand & Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative w-8 h-8 flex items-center justify-center rounded overflow-hidden">
                  <img
                    key={theme}
                    src={logoPath}
                    alt="Kademia Logo"
                    className="w-full h-full object-contain"
                    onError={handleImageError}
                  />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                    Kademia Booking
                  </h1>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wider font-medium">
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
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Dark Mode"
                className="hidden sm:flex items-center p-1.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

              {/* Separator */}
              <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

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
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`lg:hidden fixed top-14 right-0 z-50 w-64 h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 space-y-1">
          {/* User Info Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="relative w-10 h-10 flex items-center justify-center rounded overflow-hidden">
                <img
                  key={`mobile-${theme}`}
                  src={logoPath}
                  alt="Kademia Logo"
                  className="w-full h-full object-contain"
                  onError={handleImageError}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Kademia Booking
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Hệ thống nội bộ
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-600 dark:text-gray-500">
                <BriefcaseBusiness className="w-3 h-3 mr-1" />
                <span>Company App</span>
              </div>
              <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs">
                v1.0
              </span>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-0.5">
            <NavItem
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<Home className="w-4 h-4" />}
            >
              Phòng họp
            </NavItem>

            <NavItem
              to="/my-bookings"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<CalendarDays className="w-4 h-4" />}
            >
              Lịch của tôi
            </NavItem>

            <NavItem
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<UserCircle className="w-4 h-4" />}
            >
              Thông tin
            </NavItem>
            {/* Thêm link Quản trị cho Mobile - Chỉ hiện cho Admin */}
            {isAdmin && (
              <NavItem
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                icon={<Shield className="w-4 h-4" />}
              >
                Quản trị
              </NavItem>
            )}
          </div>

          {/* Mobile Theme Toggle */}
          <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                {theme === "light" ? (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    <span className="font-medium text-sm">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    <span className="font-medium text-sm">Light Mode</span>
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Company Info */}
          <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="px-3 py-2">
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-500 mb-1">
                <Building className="w-3 h-3 mr-1.5" />
                <span>Kademia Company</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-500">
                Dành riêng cho nhân viên nội bộ
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
