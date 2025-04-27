import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import api from "../api/api"; // Assuming your api setup is correct
import ImageTable from "./ImageTable"

// Simple Close Icon Component (optional, you can use an SVG or library)
const CloseIcon = () => (
      <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
      >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
);

const ImageUploader = () => {
      // react-hook-form setup
      const { register, handleSubmit, watch, reset, setValue } = useForm();

      // State for previews, loading, and feedback
      const [imagePreviews, setImagePreviews] = useState([]); // Stores { url: string, file: File }
      const [isLoading, setIsLoading] = useState(false);
      const [uploadedImages, setUploadedImages] = useState([]); // Store uploaded images if needed
      const [uploadStatus, setUploadStatus] = useState({
            // 'idle', 'success', 'error'
            state: "idle",
            message: "",
      });

      // Watch for changes in the file input
      const imageFiles = watch("images"); // This is a FileList or undefined

      // Generate or clear previews when imageFiles changes
      useEffect(() => {
            if (imageFiles && imageFiles.length > 0) {
                  const currentFiles = Array.from(imageFiles);
                  const newPreviews = currentFiles.map((file) => ({
                        url: URL.createObjectURL(file),
                        file: file, // Keep track of the file object
                  }));

                  setImagePreviews(newPreviews);
                  setUploadStatus({ state: "idle", message: "" }); // Reset status on new selection

                  // Cleanup function to revoke object URLs
                  return () => {
                        newPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
                  };
            } else {
                  // If imageFiles becomes empty (e.g., form reset), clear previews
                  setImagePreviews([]);
            }
      }, [imageFiles]); // Dependency: run when imageFiles changes

      // Handle removal of a specific image preview
      const handleRemoveImage = useCallback(
            (indexToRemove) => {
                  // 1. Revoke the object URL for the removed image
                  URL.revokeObjectURL(imagePreviews[indexToRemove].url);

                  // 2. Update the previews state
                  const filteredPreviews = imagePreviews.filter(
                        (_, index) => index !== indexToRemove
                  );
                  setImagePreviews(filteredPreviews);

                  // 3. Update the react-hook-form state (FileList)
                  // Create a new FileList excluding the removed file
                  const currentFiles = Array.from(imageFiles || []);
                  const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);

                  // Create a new DataTransfer object to build a FileList
                  const dataTransfer = new DataTransfer();
                  updatedFiles.forEach((file) => dataTransfer.items.add(file));

                  // Set the value of the 'images' field in react-hook-form
                  setValue("images", dataTransfer.files, { shouldDirty: true }); // Mark form as dirty
            },
            [imagePreviews, imageFiles, setValue]
      ); // Dependencies for useCallback

      // Handle form submission
      const onSubmit = async () => {
            if (!imagePreviews || imagePreviews.length === 0) {
                  setUploadStatus({ state: "error", message: "No images selected for upload." });
                  return;
            }

            setIsLoading(true);
            setUploadStatus({ state: "idle", message: "" }); // Reset status before new upload

            const formData = new FormData();
            // **Crucial:** Append each file with the same key 'images'
            imagePreviews.forEach((preview) => {
                  formData.append("images", preview.file);
            });

            try {
                  const res = await api.post("/upload", formData);

                  console.log("Upload successful:", res.data);
                  setUploadStatus({ state: "success", message: "Images uploaded successfully!" });
                  setUploadedImages(res.data);
                  // Clear form and previews on success
                  reset(); // Resets react-hook-form fields
                  setImagePreviews([]); // Clear previews state explicitly
            } catch (error) {
                  console.error("Upload failed:", error);
                  const message =
                        error.response?.data?.message ||
                        error.message ||
                        "An unknown error occurred.";
                  setUploadStatus({ state: "error", message: `Upload failed: ${message}` });
            } finally {
                  setIsLoading(false);
            }
      };

      // --- Render JSX ---
      return (
            <>
                  <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                              Upload Images
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                              {/* Styled File Input Area */}
                              <div>
                                    <label
                                          htmlFor="image-upload"
                                          className={`
                            flex justify-center items-center w-full px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-md cursor-pointer
                            hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200 ease-in-out
                            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                                    >
                                          <span className="flex items-center space-x-2">
                                                <svg
                                                      className="w-6 h-6 text-gray-500"
                                                      fill="currentColor"
                                                      viewBox="0 0 20 20"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                >
                                                      <path
                                                            fillRule="evenodd"
                                                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                            clipRule="evenodd"
                                                      ></path>
                                                </svg>
                                                <span className="font-medium text-gray-600">
                                                      {imagePreviews.length > 0
                                                            ? `${imagePreviews.length} image(s) selected`
                                                            : "Click to select images"}
                                                </span>
                                          </span>
                                    </label>
                                    <input
                                          id="image-upload"
                                          type="file"
                                          accept="image/*"
                                          multiple // Allow multiple file selection
                                          {...register("images")} // Register with react-hook-form
                                          className="hidden" // Hide the default input
                                          disabled={isLoading}
                                    />
                              </div>

                              {/* Image Previews Area */}
                              {imagePreviews.length > 0 && (
                                    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                                          <h3 className="text-sm font-medium text-gray-600 mb-3">
                                                Selected Images:
                                          </h3>
                                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                                {imagePreviews.map((preview, index) => (
                                                      <div
                                                            key={preview.url}
                                                            className="relative group"
                                                      >
                                                            <img
                                                                  src={preview.url}
                                                                  alt={`Preview ${index}`}
                                                                  className="w-full h-24 object-cover rounded-md shadow-sm"
                                                            />
                                                            {/* Remove Button */}
                                                            <button
                                                                  type="button" // Prevent form submission
                                                                  onClick={() =>
                                                                        !isLoading &&
                                                                        handleRemoveImage(index)
                                                                  }
                                                                  disabled={isLoading}
                                                                  className={`
                                            absolute top-0 right-0 m-1 p-0.5 bg-red-500 text-white rounded-full
                                            opacity-75 group-hover:opacity-100 transition-opacity duration-150
                                            focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75
                                            ${isLoading ? "cursor-not-allowed" : "hover:bg-red-600"}
                                        `}
                                                                  aria-label={`Remove image ${index + 1}`}
                                                            >
                                                                  <CloseIcon />
                                                            </button>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {/* Feedback Messages */}
                              <div className="h-6 mt-1 text-sm text-center">
                                    {" "}
                                    {/* Placeholder for height consistency */}
                                    {uploadStatus.state === "success" && (
                                          <p className="text-green-600">{uploadStatus.message}</p>
                                    )}
                                    {uploadStatus.state === "error" && (
                                          <p className="text-red-600">{uploadStatus.message}</p>
                                    )}
                              </div>

                              {/* Upload Button */}
                              <div className="flex justify-center pt-4">
                                    <button
                                          type="submit"
                                          disabled={isLoading || imagePreviews.length === 0}
                                          className={`
                            inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white
                            bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                            disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 ease-in-out
                        `}
                                    >
                                          {isLoading ? (
                                                <>
                                                      <svg
                                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                      >
                                                            <circle
                                                                  className="opacity-25"
                                                                  cx="12"
                                                                  cy="12"
                                                                  r="10"
                                                                  stroke="currentColor"
                                                                  strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                  className="opacity-75"
                                                                  fill="currentColor"
                                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                      </svg>
                                                      Uploading...
                                                </>
                                          ) : (
                                                `Upload ${imagePreviews.length} Image(s)`
                                          )}
                                    </button>
                              </div>
                        </form>
                  </div>

                  {uploadedImages.length > 0 && (
                        <div className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                    Uploaded Images
                              </h2>
                              <ImageTable images={uploadedImages} />
                        </div>
                  )}
            </>
      );
};

export default ImageUploader;
