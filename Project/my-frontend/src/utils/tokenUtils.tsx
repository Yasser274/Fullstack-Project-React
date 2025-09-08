import { jwtDecode } from "jwt-decode";
import type { User } from "../context/AuthContext&Global";

// handle token expiration if it is logout the user
export const isTokenExpired = (token: string) => {
   try {
      const decoded: User = jwtDecode(token);
      const currentTime = Date.now() / 1000; // get current time in seconds

      // If the expiration time is less than the current time, the token is expired. (true means expired false not expired)
      return decoded.exp < currentTime;
   } catch (error) {
      // If an error occurs during decoding
      console.error("Failed to decode Token:", error);
      // true because token isn't working
      return true;
   }
};
