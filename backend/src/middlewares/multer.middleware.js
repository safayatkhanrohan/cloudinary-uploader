import os from "os";
import path from "path";
import fs from "fs";
import multer from "multer";

// Ensure that the directory exists
const tempDir = path.join(os.tmpdir(), "uploads");
if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
      destination: function (req, file, cb) {
            cb(null, tempDir); // Save files in /tmp/uploads
      },
      filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, file.originalname + "-" + uniqueSuffix);
      },
});

export const upload = multer({ storage });
