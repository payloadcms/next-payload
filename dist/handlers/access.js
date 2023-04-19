"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const access_1 = __importDefault(require("payload/dist/auth/operations/access"));
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const initializePassport_1 = __importDefault(require("../middleware/initializePassport"));
const withPayload_1 = __importDefault(require("../middleware/withPayload"));
async function handler(req, res) {
    const accessResult = await (0, access_1.default)({
        req,
    });
    return res.status(http_status_1.default.OK).json(accessResult);
}
exports.default = (0, withPayload_1.default)((0, initializePassport_1.default)((0, authenticate_1.default)(handler)));
exports.config = {
    api: {
        externalResolver: true
    }
};
//# sourceMappingURL=access.js.map