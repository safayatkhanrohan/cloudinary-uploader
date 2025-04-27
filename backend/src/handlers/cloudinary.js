import cloudinary, { v2 } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../constant.js";

cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
});

const uploadFile = async (file, dest) => {
      try {
            const res = await v2.uploader.upload(file, {
                  folder: dest,
                  resource_type: "auto",
                  access_mode: "public",
            });
            return {
                  public_id: res.public_id,
                  url: res.secure_url,
            };
      } catch (error) {
            console.error("Cloudinary upload error:", error);
      } finally {
            fs.unlinkSync(file); // Ensure the file is deleted even if upload fails
      }
};

export { uploadFile };
