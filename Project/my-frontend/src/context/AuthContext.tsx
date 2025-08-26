// .Context makes this component widely accessed by all other components (this component is to check for user login status)

import { createContext, useState, useContext, type ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Defining the shape of the user data gotten from the token
interface User {
   userId: number;
   username: string;
   profilePictureURL: string;
   email:string
}
// Define the shape of the context's value
interface AuthContextType {
   user: User | null;
   login: (token: string) => void;
   logout: () => void;
}
// This is to toggle between null(user not logged in) and (AuthContextType data type which has user info)
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [user, setUser] = useState<User | null>(null);

   // This effect runs once when the app loads
   useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
         const decodedUser: User = jwtDecode(token);
         console.log(decodedUser);
         setUser(decodedUser);
      }

      // no need for a return (cleanup only for EventListeners)
   }, []);

   //  Login Function
   const login = (token: string) => {
      localStorage.setItem("token", token);
      const decodedUser: User = jwtDecode(token);
      setUser(decodedUser);
   };

   //  Logout Function
   const logout = () => {
      localStorage.removeItem("token");
      setUser(null);
   };

   return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};
