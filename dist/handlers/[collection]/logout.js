"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const logout_1 = __importDefault(require("payload/dist/auth/operations/logout"));
const errorHandler_1 = __importDefault(require("payload/dist/express/middleware/errorHandler"));
const withPayload_1 = __importDefault(require("../../middleware/withPayload"));
const convertPayloadJSONBody_1 = __importDefault(require("../../middleware/convertPayloadJSONBody"));
const initializePassport_1 = __importDefault(require("../../middleware/initializePassport"));
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const cookie_1 = __importDefault(require("../../middleware/cookie"));
async function handler(req, res) {
    var _a;
    if (typeof req.query.collection !== 'string') {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: 'Collection not specified',
        });
    }
    if (!((_a = req.payload.collections) === null || _a === void 0 ? void 0 : _a[req.query.collection])) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: 'Collection not found',
        });
    }
    try {
        const message = await (0, logout_1.default)({
            collection: req.payload.collections[req.query.collection],
            res,
            req,
        });
        return res.status(http_status_1.default.OK).json({ message });
    }
    catch (error) {
        const errorHandler = (0, errorHandler_1.default)(req.payload.config, req.payload.logger);
        return errorHandler(error, req, res, () => null);
    }
}
exports.default = (0, withPayload_1.default)((0, convertPayloadJSONBody_1.default)((0, initializePassport_1.default)((0, authenticate_1.default)((0, cookie_1.default)(handler)))));
exports.config = {
    api: {
        externalResolver: true
    }
};
//# sourceMappingURL=logout.js.map