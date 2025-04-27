import { app } from "./app.js";
import * as constants from "./constant.js";

const requiredEnvVars = Object.keys(constants);

const missingVars = requiredEnvVars.filter((key) => !constants[key]);
if (missingVars.length) {
      console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
      process.exit(1); // Exit process if required variables are missing
}

// Function to gracefully shut down the server
const gracefulShutdown = async (server) => {
      console.log("Shutting down server gracefully...");
      try {
            await server.close();
            console.log("Server closed.");
            process.exit(0);
      } catch (err) {
            console.error("Error during server shutdown", err);
            process.exit(1);
      }
};

// Start the server
(() => {
      try {
            const server = app.listen(constants.PORT, () => {
                  console.log(`Server is running on port ${constants.PORT}`);
            });

            // Handle server-level errors
            server.on("error", (err) => {
                  console.error("Server listen error!", err);
                  process.exit(1); // Exit on critical server errors
            });

            // Handle process-level signals for clean exit
            process.on("SIGINT", () => gracefulShutdown(server));
            process.on("SIGTERM", () => gracefulShutdown(server));
            process.on("uncaughtException", (err) => {
                  console.error("Uncaught Exception:", err);
                  gracefulShutdown(server);
            });
            process.on("unhandledRejection", (reason) => {
                  console.error("Unhandled Rejection:", reason);
                  gracefulShutdown(server);
            });
      } catch (err) {
            console.error("Failed to initialize application!", err);
            process.exit(1); // Exit on critical errors
      }
})();
