import type { Request, Response, NextFunction } from "express";

// .Admin check (runs AFTER authenticateToken, so req.user is already the verified JWT payload)
// the admins are the user ids in the ADMIN_USER_IDS env var of the Lambda, comma separated (EX: "1" or "1,7")
// * the userId comes from a token my server signed with JWT_SECRET, so nobody can fake being user 1
// * nothing to type or store on the frontend, i just log in with my normal account
// * to remove someone's admin access i only edit the env var (no deploy needed)
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
   const adminIds = (process.env.ADMIN_USER_IDS || "")
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter(Number.isFinite);

   // if the env var is missing nobody is admin (safe default)
   if (!req.user || !adminIds.includes(req.user.userId)) {
      return res.status(403).json({ message: "Admins only." });
   }

   next();
};

export default requireAdmin;
