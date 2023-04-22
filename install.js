const path = require("path");
const fs = require("fs");
const copyRecursiveSync = require("./utilities/copyRecursiveSync");
const copyFile = require("./utilities/copyFile");

module.exports = () => {
  const useSrc =
    fs.existsSync(path.resolve(process.cwd()), "./src/app") ||
    fs.existsSync(path.resolve(process.cwd()), "./src/pages");

  const basePath = useSrc ? "./src" : ".";

  // Copy handlers into /api
  copyRecursiveSync(
    path.resolve(__dirname, "./templates/pages/api"),
    path.resolve(process.cwd(), `${basePath}/pages/api`)
  );

  // Copy admin into /app
  copyRecursiveSync(
    path.resolve(__dirname, "./templates/app"),
    path.resolve(process.cwd(), `${basePath}/app`)
  );

  const payloadConfigPath = path.resolve(process.cwd(), `${basePath}/payload`);

  if (!fs.existsSync(payloadConfigPath)) {
    fs.mkdirSync(payloadConfigPath);
  }

  // Copy payload initialization
  copyFile(
    path.resolve(__dirname, "./templates/payloadClient.ts"),
    path.resolve(process.cwd(), `${basePath}/payload/payloadClient.ts`)
  );

  // Copy base payload config
  copyFile(
    path.resolve(__dirname, "./templates/payload.config.ts"),
    path.resolve(process.cwd(), `${basePath}/payload/payload.config.ts`)
  );

  process.exit(0);
};
