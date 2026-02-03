import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Facebook, Linkedin, Shield } from "lucide-react";

// Import ảnh logo trực tiếp
import logoLight from "../assets/logo-light.png";
import logoDark from "../assets/logo-dark.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  // Sử dụng ảnh đã import
  const logoPath = theme === "light" ? logoLight : logoDark;

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden">
                <img
                  key={theme}
                  src={logoPath}
                  alt="Kademia Logo"
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
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
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Kademia
                </h3>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  Booking System
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Hệ thống đặt phòng nội bộ tích hợp Microsoft 365.
            </p>
            {/* Mạng xã hội */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Phòng họp", path: "/" },
                { name: "Lịch của tôi", path: "/my-bookings" },
                { name: "Thông tin", path: "/profile" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Hỗ trợ
            </h4>
            <ul className="space-y-2">
              {["Trung tâm trợ giúp", "Liên hệ IT", "FAQ"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Thông tin */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <a
                href="#"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors block"
              >
                Chính sách bảo mật
              </a>
              <a
                href="#"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors block"
              >
                Điều khoản dịch vụ
              </a>
              <div className="pt-2 text-xs text-gray-500 dark:text-gray-600">
                <span className="text-violet-600 dark:text-violet-400 font-medium">
                  Kademia Booking
                </span>
                <br />
                Power Apps Team
              </div>
            </div>
          </div>
        </div>

        {/* Thanh cuối (Bottom Bar) */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear}{" "}
              <span className="text-violet-600 dark:text-violet-400">
                Kademia Booking System
              </span>
              . Nội bộ công ty.
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500 dark:text-gray-600 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                <span className="text-violet-600 dark:text-violet-400">
                  v2.1.0
                </span>
                <span className="text-gray-400 dark:text-gray-600 mx-1">•</span>
                Premium
              </span>
            </div>
          </div>

          {/* Badge hệ thống */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Microsoft 365
            </div>
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Bảo mật
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
