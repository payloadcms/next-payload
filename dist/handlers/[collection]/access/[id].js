"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const docAccess_1 = require("payload/dist/collections/operations/docAccess");
const errorHandler_1 = __importDefault(require("payload/dist/express/middleware/errorHandler"));
const authenticate_1 = __importDefault(require("../../../middleware/authenticate"));
const initializePassport_1 = __importDefault(require("../../../middleware/initializePassport"));
const withPayload_1 = __importDefault(require("../../../middleware/withPayload"));
const dataLoader_1 = __importDefault(require("../../../middleware/dataLoader"));
async function handler(req, res) {
    try {
        const docAccessResult = await (0, docAccess_1.docAccess)({
            id: req.query.id,
            req: {
                ...req,
                collection: req.payload.collections[req.query.collection],
            }
        });
        return res.status(http_status_1.default.OK).json(docAccessResult);
    }
    catch (error) {
        const errorHandler = (0, errorHandler_1.default)(req.payload.config, req.payload.logger);
        return errorHandler(error, req, res, () => null);
    }
}
exports.default = (0, withPayload_1.default)((0, dataLoader_1.default)((0, initializePassport_1.default)((0, authenticate_1.default)(handler))));
exports.config = {
    api: {
        externalResolver: true
    }
};
//# sourceMappingURL=%5Bid%5D.js.map