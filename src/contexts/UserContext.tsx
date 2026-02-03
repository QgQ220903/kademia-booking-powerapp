// File: src/contexts/UserContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Office365UsersService } from "../generated/services/Office365UsersService";
import type { GraphUser_V1 } from "../generated/models/Office365UsersModel";

interface UserContextType {
  user: GraphUser_V1 | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<GraphUser_V1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);

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

      console.log("UserContext - API Response:", result);

      if (result.data) {
        console.log("UserContext - User data received:", result.data);
        setUser(result.data);
      } else {
        console.log("UserContext - No data received from API");
        setError("Không nhận được dữ liệu từ API");
      }
    } catch (err: any) {
      console.error("UserContext - Failed to fetch user profile:", err);
      setError(
        `Không thể tải thông tin người dùng: ${err.message || "Lỗi không xác định"}`,
      );

      // Thử fallback với API cũ nếu API mới thất bại
      try {
        console.log("Trying fallback to MyProfile (V1)...");
        const fallbackResult = await Office365UsersService.MyProfile();
        if (fallbackResult.data) {
          console.log("Fallback successful, data:", fallbackResult.data);
          // Convert từ User model sang GraphUser_V1 model
          const convertedUser: GraphUser_V1 = {
            id: fallbackResult.data.Id,
            displayName: fallbackResult.data.DisplayName,
            givenName: fallbackResult.data.GivenName,
            surname: fallbackResult.data.Surname,
            mail: fallbackResult.data.Mail,
            userPrincipalName: fallbackResult.data.UserPrincipalName,
            jobTitle: fallbackResult.data.JobTitle,
            department: fallbackResult.data.Department,
            companyName: fallbackResult.data.CompanyName,
            officeLocation: fallbackResult.data.OfficeLocation,
            mobilePhone:
              fallbackResult.data.mobilePhone ||
              fallbackResult.data.TelephoneNumber,
            businessPhones: fallbackResult.data.BusinessPhones,
          };
          setUser(convertedUser);
          setError(null);
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
      }
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
    <UserContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
