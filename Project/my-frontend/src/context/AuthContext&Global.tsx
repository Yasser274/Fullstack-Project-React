// .Context makes this component widely accessed by all other components (this component is to check for user login status)

import { createContext, useState, useContext, type ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "../utils/tokenUtils";

// Defining the shape of the user data gotten from the token
export interface User {
   userId: number;
   username: string;
   profilePictureURL: string;
   email: string;
   exp: number;
}
// Define the shape of the context's value
interface AuthContextType {
   user: User | null;
   login: (token: string) => void;
   logout: () => void;
   isSessionExpired: boolean; // to signal the modal
   closeModalSession: () => void; // To close the modal
}
// This is to toggle between null(user not logged in) and (AuthContextType data type which has user info)
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [user, setUser] = useState<User | null>(null);

   const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

   // This effect runs once when the app loads
   useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
         // if token is expired
         if (isTokenExpired(token)) {
            // token found in localstorage and remove it
            localStorage.removeItem("token");
            setUser(null);
            setIsSessionExpired(true);
         } else {
            // Token is valid, log the user in
            const decodedUser: User = jwtDecode(token);
            setUser(decodedUser);
         }
      }
   }, []);

   // This effect sets up a recurring check ONLY WHEN a user is logged in
   useEffect(() => {
      if (!user) {
         return;
      }
      // Check every 30 seconds
      const intervalId = setInterval(() => {
         const token = localStorage.getItem("token");
         if (token && isTokenExpired(token)) {
            console.log("Session expired, logging out.");
            setIsSessionExpired(true); // Signal that the session expired
            logout(); // Perform the logout
         }
      }, 30000); // 30000 ms = 30 seconds

      // Cleanup function: clear the interval when the component unmounts
      // or when the `user` state changes (e.g., on manual logout).
      return () => clearInterval(intervalId);
   }, [user]);

   //  Login Function
   const login = (token: string) => {
      localStorage.setItem("token", token);
      const decodedUser: User = jwtDecode(token);
      setUser(decodedUser);
      setIsSessionExpired(false);
   };

   //  Logout Function
   const logout = () => {
      localStorage.removeItem("token");
      setUser(null);
   };

   // Function to allow components to close the expiration modal
   const closeModalSession = () => {
      setIsSessionExpired(false);
   };

   return (
      <AuthContext.Provider value={{ user, login, logout, isSessionExpired, closeModalSession }}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => {
   const context = useContext(AuthContext); // open the portal so any components can access it no matter if it's a child grandchild etc
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};
