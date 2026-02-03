// File: src/contexts/UserContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Office365UsersService } from "../generated/services/Office365UsersService";
import type { GraphUser_V1 } from "../generated/models/Office365UsersModel";

interface UserContextType {
  user: GraphUser_V1 | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean; // THÊM DÒNG NÀY
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  isAdmin: false, // GIÁ TRỊ MẶC ĐỊNH
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<GraphUser_V1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // THÊM DÒNG NÀY

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsAdmin(false); // Reset mỗi lần fetch

      // Sử dụng MyProfile_V2 với đầy đủ fields
      const result = await Office365UsersService.MyProfile_V2(
        "id,displayName,givenName,surname,mail,userPrincipalName," +
          "jobTitle,department,companyName,officeLocation," +
          "businessPhones,mobilePhone,hireDate," +
          "preferredLanguage,userType,accountEnabled," +
          "city,country,postalCode,state,streetAddress," +
          "mailNickname,aboutMe,birthday,interests,mySite," +
          "pastProjects,responsibilities,schools,skills,preferredName",
      );

      if (result.data) {
        const ADMIN_EMAIL = "QuyQG@kademia.edu.vn";
        const userEmail = result.data.userPrincipalName || result.data.mail;
        setUser(result.data);
        if (userEmail === ADMIN_EMAIL) {
          console.log("User is Admin");
          setIsAdmin(true);
        }
      } else {
        setError("Không nhận được dữ liệu từ API");
      }
    } catch (err: any) {
      console.error("UserContext - Failed to fetch user profile:", err);
      setError(
        `Không thể tải thông tin người dùng: ${err.message || "Lỗi không xác định"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <UserContext.Provider
      value={{ user, loading, error, isAdmin, refreshUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
