// for file uploads (library/package)
import multer from "multer";
import path from "path";
import fs from "fs";
import { type Request } from "express";

const uploadDir = "profilePicUsers/";
// Ensure the 'profilePicUsers' directory exists if it doesn't create (mkdir) new dir called that
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
}

// Define the storage configuration (where and how to store uploaded files.)
const storage = multer.diskStorage({
   destination: function (req: Request, file: Express.Multer.File, cb) {
      cb(null, uploadDir); // Destination folder
   },
   filename: function (req: Request, file: Express.Multer.File, cb) {
      // Create a unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
   },
});

// 2. Create the Multer instance and export it
export const uploadImg = multer({
   storage: storage,
   limits: {
      fileSize: 1024 * 1024 * 8, // 8MB limit
   },
   //  fileFilter here too for better organization
   fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      // Checks the MIME type sent by the client (e.g. image/png, image/jpeg) to make sure it matches the allowed types.
      const mimetype = allowedTypes.test(file.mimetype);
      // Checks the actual file extension (.jpg, .png, etc.) from the filename. and toLowerCase so it doesn't become case sensitive
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

      if (mimetype && extname) {
         return cb(null, true); // if both are true ✅ Accept file
      }
      cb(new Error("Error: File upload only supports the following filetypes - " + allowedTypes));
   },
});
