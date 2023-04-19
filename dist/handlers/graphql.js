"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const NotFound_1 = __importDefault(require("payload/dist/errors/NotFound"));
const errorHandler_1 = __importDefault(require("payload/dist/express/middleware/errorHandler"));
const graphQLHandler_1 = __importDefault(require("payload/dist/graphql/graphQLHandler"));
const withPayload_1 = __importDefault(require("../middleware/withPayload"));
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const initializePassport_1 = __importDefault(require("../middleware/initializePassport"));
const i18n_1 = __importDefault(require("../middleware/i18n"));
const dataLoader_1 = __importDefault(require("../middleware/dataLoader"));
async function handler(req, res, next) {
    try {
        req.payloadAPI = 'graphQL';
        if (req.method === 'POST') {
            return (0, graphQLHandler_1.default)(req, res)(req, res, next);
        }
        if (req.method === 'OPTIONS') {
            res.status(http_status_1.default.OK);
        }
    }
    catch (error) {
        const errorHandler = (0, errorHandler_1.default)(req.payload.config, req.payload.logger);
        return errorHandler(error, req, res, () => null);
    }
    return res.status(http_status_1.default.NOT_FOUND).json(new NotFound_1.default(req.t));
}
exports.default = (0, withPayload_1.default)((0, dataLoader_1.default)((0, i18n_1.default)((0, initializePassport_1.default)((0, authenticate_1.default)(handler)))));
exports.config = {
    api: {
        externalResolver: true
    }
};
//# sourceMappingURL=graphql.js.map