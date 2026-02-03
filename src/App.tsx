import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RoomList from "./components/RoomList";
import BookingForm from "./components/BookingForm";
import MyBookings from "./components/MyBooking";
import UserProfilePage from "./components/UserProfilePage";
import AdminDashboard from "./pages/AdminDashboard"; // THÊM IMPORT
import AdminProtectedRoute from "./components/AdminProtectedRoute"; // THÊM IMPORT
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<RoomList />} />
                <Route path="/book" element={<BookingForm />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/profile" element={<UserProfilePage />} />

                {/* ROUTE ADMIN MỚI */}
                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
