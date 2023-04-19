"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const refresh_1 = __importDefault(require("payload/dist/auth/operations/refresh"));
const getExtractJWT_1 = __importDefault(require("payload/dist/auth/getExtractJWT"));
const errorHandler_1 = __importDefault(require("payload/dist/express/middleware/errorHandler"));
const withPayload_1 = __importDefault(require("../../middleware/withPayload"));
const convertPayloadJSONBody_1 = __importDefault(require("../../middleware/convertPayloadJSONBody"));
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const dataLoader_1 = __importDefault(require("../../middleware/dataLoader"));
const cookie_1 = __importDefault(require("../../middleware/cookie"));
async function handler(req, res) {
    var _a;
    try {
        let token;
        const extractJWT = (0, getExtractJWT_1.default)(req.payload.config);
        token = extractJWT(req);
        if (req.body.token) {
            token = req.body.token;
        }
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
        const result = await (0, refresh_1.default)({
            req,
            res,
            collection: req.payload.collections[req.query.collection],
            token,
        });
        return res.status(http_status_1.default.OK).json({
            message: 'Token refresh successful',
            ...result,
        });
    }
    catch (error) {
        const errorHandler = (0, errorHandler_1.default)(req.payload.config, req.payload.logger);
        return errorHandler(error, req, res, () => null);
    }
}
exports.config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    }
};
exports.default = (0, withPayload_1.default)((0, dataLoader_1.default)((0, fileUpload_1.default)((0, convertPayloadJSONBody_1.default)((0, cookie_1.default)(handler)))));
//# sourceMappingURL=refresh.js.map