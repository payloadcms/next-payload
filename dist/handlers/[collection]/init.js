"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const init_1 = __importDefault(require("payload/dist/auth/operations/init"));
const withPayload_1 = __importDefault(require("../../middleware/withPayload"));
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
    const Model = req.payload.collections[req.query.collection].Model;
    const initialized = await (0, init_1.default)({ req, Model });
    return res.status(http_status_1.default.OK).json({ initialized });
}
exports.default = (0, withPayload_1.default)(handler);
exports.config = {
    api: {
        externalResolver: true
    }
};
//# sourceMappingURL=init.js.map