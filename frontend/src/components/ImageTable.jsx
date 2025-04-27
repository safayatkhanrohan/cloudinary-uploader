import React, { useState } from "react";
// Optional: Import an icon library like react-icons
import { FiCopy, FiCheck } from "react-icons/fi";

export default function ImageTable({ images }) {
      // State to track which URL was just copied for feedback
      const [copiedUrl, setCopiedUrl] = useState(null);

      const handleCopy = async (url) => {
            try {
                  await navigator.clipboard.writeText(url);
                  setCopiedUrl(url); // Set the copied URL for feedback
                  // Reset the feedback after a couple of seconds
                  setTimeout(() => setCopiedUrl(null), 2000);
            } catch (err) {
                  console.error("Failed to copy URL: ", err);
                  // Optionally show an error message to the user
                  alert("Failed to copy URL.");
            }
      };

      // Handle case where there are no images
      if (!images || images.length === 0) {
            return (
                  <div className="mt-6 p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        No images uploaded yet.
                  </div>
            );
      }

      return (
            <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                  {" "}
                  {/* Added shadow and rounded corners */}
                  <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                              {" "}
                              {/* Slightly darker header */}
                              <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                          Preview
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                          URL
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                          {" "}
                                          {/* Centered Action */}
                                          Action
                                    </th>
                              </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                              {images.map((img, idx) => (
                                    // Using img.url as key assumes URLs are unique. If not, use a proper ID if available.
                                    <tr
                                          key={img?.url || idx}
                                          className="hover:bg-gray-50 transition-colors duration-150"
                                    >
                                          {" "}
                                          {/* Added hover effect */}
                                          <td className="px-6 py-4 whitespace-nowrap align-middle">
                                                {" "}
                                                {/* Added align-middle */}
                                                {img?.url ? (
                                                      <img
                                                            src={img.url}
                                                            // Try to provide more meaningful alt text if possible
                                                            alt={`Uploaded content ${idx + 1}`}
                                                            className="w-20 h-20 object-cover rounded" // Fixed size, object-cover
                                                            loading="lazy" // Lazy load images
                                                      />
                                                ) : (
                                                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                                            No Preview
                                                      </div>
                                                )}
                                          </td>
                                          <td className="px-6 py-4 align-middle">
                                                {" "}
                                                {/* Added align-middle */}
                                                <span className="text-sm text-gray-700 break-all">
                                                      {" "}
                                                      {/* Allow long URLs to break */}
                                                      {img?.url || "No URL provided"}
                                                </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
                                                {" "}
                                                {/* Added align-middle */}
                                                <button
                                                      onClick={() => handleCopy(img?.url)}
                                                      disabled={!img?.url || copiedUrl === img.url} // Disable if no URL or already copied
                                                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out
                                        ${
                                              copiedUrl === img.url
                                                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" // Green for copied
                                                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" // Blue normally
                                        }
                                        ${!img?.url ? "opacity-50 cursor-not-allowed" : ""} // Style for disabled state
                                    `}
                                                >
                                                      {copiedUrl === img.url ? (
                                                            <>
                                                                  <FiCheck
                                                                        className="h-4 w-4 mr-1.5"
                                                                        aria-hidden="true"
                                                                  />
                                                                  Copied!
                                                            </>
                                                      ) : (
                                                            <>
                                                                  <FiCopy
                                                                        className="h-4 w-4 mr-1.5"
                                                                        aria-hidden="true"
                                                                  />
                                                                  Copy URL
                                                            </>
                                                      )}
                                                </button>
                                          </td>
                                    </tr>
                              ))}
                        </tbody>
                  </table>
            </div>
      );
}
