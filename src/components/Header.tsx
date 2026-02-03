import { Link, useLocation } from "react-router-dom";
import UserProfile from "./UserProfile";
import { useTheme } from "../contexts/ThemeContext";
import { useState } from "react";

// Import ảnh logo trực tiếp
import logoLight from "../assets/logo-light.png";
import logoDark from "../assets/logo-dark.png";

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
        relative flex items-center px-4 py-2.5 rounded-lg 
        transition-all duration-200 text-sm font-medium
        ${
          isActive
            ? "bg-violet-600 text-white shadow-md"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-violet-600 dark:hover:text-violet-400"
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
      {isActive && (
        <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
          <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
        </div>
      )}
    </Link>
  );
};

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sử dụng ảnh đã import
  const logoPath = theme === "light" ? logoLight : logoDark;

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.currentTarget;
    target.style.display = "none";

    const fallbackDiv = document.createElement("div");
    fallbackDiv.className =
      "w-full h-full bg-violet-600 flex items-center justify-center rounded-lg";
    fallbackDiv.innerHTML = `
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    `;
    target.parentElement?.appendChild(fallbackDiv);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand & Logo */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden">
                  <img
                    key={theme}
                    src={logoPath}
                    alt="Kademia Logo"
                    className="w-full h-full object-contain p-1.5"
                    onError={handleImageError}
                  />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                    Kademia Booking
                  </h1>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                    Hệ thống đặt phòng nội bộ
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
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
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                className="hidden sm:flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-medium">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-medium">Light</span>
                  </>
                )}
              </button>

              {/* Separator */}
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

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
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`lg:hidden fixed top-16 right-0 z-50 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 space-y-2">
          {/* User Info Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden">
                <img
                  key={`mobile-${theme}`}
                  src={logoPath}
                  alt="Kademia Logo"
                  className="w-full h-full object-contain p-1"
                  onError={handleImageError}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Kademia Booking
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hệ thống nội bộ
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <BriefcaseBusiness className="w-3 h-3 mr-1" />
                <span>Company App</span>
              </div>
              <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded text-xs">
                v1.0
              </span>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-1">
            <NavItem
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<Home className="w-5 h-5" />}
            >
              Phòng họp
            </NavItem>

            <NavItem
              to="/my-bookings"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<CalendarDays className="w-5 h-5" />}
            >
              Lịch của tôi
            </NavItem>

            <NavItem
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              icon={<UserCircle className="w-5 h-5" />}
            >
              Thông tin
            </NavItem>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                {theme === "light" ? (
                  <>
                    <Moon className="w-5 h-5 mr-2.5" />
                    <span className="font-medium">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5 mr-2.5" />
                    <span className="font-medium">Light Mode</span>
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Company Info */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="px-3 py-2">
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
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
