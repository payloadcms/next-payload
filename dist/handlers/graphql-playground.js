"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const graphql_playground_middleware_express_1 = __importDefault(require("graphql-playground-middleware-express"));
const withPayload_1 = __importDefault(require("../middleware/withPayload"));
async function handler(req, res) {
    return (0, graphql_playground_middleware_express_1.default)({
        endpoint: `${req.payload.config.routes.api}${req.payload.config.routes.graphQL}`,
        settings: {
            'request.credentials': 'include'
        }
    })(req, res, () => null);
}
exports.default = (0, withPayload_1.default)(handler);
exports.config = {
    api: {
        externalResolver: true
    }
};
//# sourceMappingURL=graphql-playground.js.map