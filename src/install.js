const path = require("path");
const fs = require("fs");
const copyRecursiveSync = require("./utilities/copyRecursiveSync");
const copyFile = require("./utilities/copyFile");

module.exports = () => {
  // Copy handlers into /api
  copyRecursiveSync(
    path.resolve(__dirname, "./src/handlers/api"),
    path.resolve(process.cwd(), "./pages/api")
  );

  // Copy admin into /app
  copyRecursiveSync(
    path.resolve(__dirname, "./src/handlers/app"),
    path.resolve(process.cwd(), "./app")
  );

  // Copy payload initialization
  copyFile(
    path.resolve(__dirname, "./src/handlers/payload.ts"),
    path.resolve(process.cwd(), "./payload.ts")
  );

  const payloadConfigPath = path.resolve(process.cwd(), "./src/payload");

  if (!fs.existsSync(payloadConfigPath)) {
    fs.mkdirSync(payloadConfigPath);
  }

  // Copy base payload config
  copyFile(
    path.resolve(__dirname, "./src/handlers/payload.config.ts"),
    path.resolve(process.cwd(), "./src/payload.config.ts")
  );

  process.exit(0);
};
