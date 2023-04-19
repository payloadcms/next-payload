"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const formatSuccess_1 = __importDefault(require("payload/dist/express/responses/formatSuccess"));
const NotFound_1 = __importDefault(require("payload/dist/errors/NotFound"));
const getTranslation_1 = require("payload/dist/utilities/getTranslation");
const errorHandler_1 = __importDefault(require("payload/dist/express/middleware/errorHandler"));
const withPayload_1 = __importDefault(require("../../../middleware/withPayload"));
const convertPayloadJSONBody_1 = __importDefault(require("../../../middleware/convertPayloadJSONBody"));
const authenticate_1 = __importDefault(require("../../../middleware/authenticate"));
const initializePassport_1 = __importDefault(require("../../../middleware/initializePassport"));
const i18n_1 = __importDefault(require("../../../middleware/i18n"));
const fileUpload_1 = __importDefault(require("../../../middleware/fileUpload"));
const dataLoader_1 = __importDefault(require("../../../middleware/dataLoader"));
const isNumber_1 = require("../../../utilities/isNumber");
async function handler(req, res) {
    var _a;
    try {
        const globalConfig = req.payload.globals.config.find(global => global.slug === req.query.global);
        if (!globalConfig) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                message: 'Global not found',
            });
        }
        const slug = typeof req.query.global === 'string' ? req.query.global : undefined;
        const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined;
        const fallbackLocale = typeof req.query.fallbackLocale === 'string' ? req.query.fallbackLocale : undefined;
        switch (req.method) {
            case 'GET': {
                const result = await req.payload.findGlobal({
                    fallbackLocale,
                    user: req.user,
                    draft: req.query.draft === 'true',
                    showHiddenFields: false,
                    overrideAccess: false,
                    slug,
                    depth: (0, isNumber_1.isNumber)((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.depth) ? Number(req.query.depth) : 1,
                    locale,
                });
                return res.status(http_status_1.default.OK).json(result);
            }
            case 'POST': {
                const global = await req.payload.updateGlobal({
                    slug,
                    locale,
                    fallbackLocale,
                    data: req.body,
                    user: req.user,
                    overrideAccess: false,
                    showHiddenFields: false,
                    draft: req.query.draft === 'true',
                });
                return res.status(http_status_1.default.OK).json({
                    ...(0, formatSuccess_1.default)(req.i18n.t('general:updatedSuccessfully', { label: (0, getTranslation_1.getTranslation)(globalConfig.label, req.i18n) }), 'message'),
                    result: global,
                });
            }
        }
    }
    catch (error) {
        const errorHandler = (0, errorHandler_1.default)(req.payload.config, req.payload.logger);
        return errorHandler(error, req, res, () => null);
    }
    return res.status(http_status_1.default.NOT_FOUND).json(new NotFound_1.default(req.t));
}
exports.config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    }
};
exports.default = (0, withPayload_1.default)((0, dataLoader_1.default)((0, fileUpload_1.default)((0, convertPayloadJSONBody_1.default)((0, i18n_1.default)((0, initializePassport_1.default)((0, authenticate_1.default)(handler)))))));
//# sourceMappingURL=index.js.map