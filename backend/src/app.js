import express from "express";
import cors from "cors";
const app = express();
import path from "path";
const __dirname = path.resolve();

import { upload } from "./middlewares/multer.middleware.js";
import { uploadFile } from "./handlers/cloudinary.js";

app.use(
      cors({
            origin: [
                  "http://localhost:5173",
                  "http://localhost:5174",
                  "https://cloudinary-uploader-rdd1.onrender.com",
            ],
            credentials: true,
      })
);

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get(/(.*)/, (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

app.post(
      "/upload",
      upload.fields([
            {
                  name: "images",
                  maxCount: 50,
            },
      ]),
      async (req, res) => {
            try {
                  const files = req.files.images;
                  if (!files || files.length === 0) {
                        return res.status(400).json({ error: "No files uploaded" });
                  }

                  // Process each file (e.g., upload to Cloudinary)
                  const results = await Promise.all(
                        files.map((file) => uploadFile(file.path, "br-uploads"))
                  );

                  res.status(200).json(results);
            } catch (error) {
                  console.error("Error during file upload:", error);
                  res.status(500).json({ error: "Internal server error" });
            }
      }
);

export { app };
