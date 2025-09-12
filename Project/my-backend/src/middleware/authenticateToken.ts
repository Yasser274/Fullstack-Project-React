import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// We need to tell TypeScript what the decoded user object will look like.
interface DecodedUser {
   userId: number;
   username: string;
   profilePictureURL: string;
   email: string;
}

declare global {
   // This says "I'm making a change that should be available everywhere."
   namespace Express {
      // "The change I'm making applies specifically to the types from the 'Express' library."
      interface Request {
         // "I am adding something to the 'Request' interface (the blueprint for `req`)."
         user?: DecodedUser;
         // The '?' makes it optional, meaning a Request might have it, or it might not.
      }
   }
}

// This middleware file we are creating is the Bouncer at the door of the VIP area
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
   console.log("--- 🛡️  AUTHENTICATION MIDDLEWARE 🛡️ ---");
   // Get the token from the request header. The format is "Bearer TOKEN"
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1];

   if (!token) {
      return res
         .status(401)
         .json({ message: "No token provided. Authorization denied", displayMessage: "Log in first" });
   }

   //  now we verify the token
   // using JWT_SECRET I created

   // This function will be called once jwt.verify is finished. It receives two possible arguments: err (if something went wrong) or user (the decoded payload if everything was successful).
   jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
         // If the token is invalid (e.g., expired, tampered with), deny access.
         console.error("JWT Verification Error:", err.message);
         return res.status(403).json({ message: "Token is not valid. Forbidden." });
      }
      // If the token is valid, the 'user' variable will be the decoded payload.
      // We attach this payload to the request object.
      req.user = user as DecodedUser;

      //  The bouncer lets you into the club.
      //  "This middleware is done. Move on to the next function in the list for this route,"
      //  Pass control to the next function in the chain (your controller).
      next();
   });
};

export default authenticateToken;
