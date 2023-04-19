"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const getTranslation_1 = require("payload/dist/utilities/getTranslation");
const NotFound_1 = __importDefault(require("payload/dist/errors/NotFound"));
const formatSuccess_1 = __importDefault(require("payload/dist/express/responses/formatSuccess"));
const errorHandler_1 = __importDefault(require("payload/dist/express/middleware/errorHandler"));
const withPayload_1 = __importDefault(require("../../middleware/withPayload"));
const convertPayloadJSONBody_1 = __importDefault(require("../../middleware/convertPayloadJSONBody"));
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const initializePassport_1 = __importDefault(require("../../middleware/initializePassport"));
const i18n_1 = __importDefault(require("../../middleware/i18n"));
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const dataLoader_1 = __importDefault(require("../../middleware/dataLoader"));
const isNumber_1 = require("../../utilities/isNumber");
const qsMiddleware_1 = __importDefault(require("../../middleware/qsMiddleware"));
async function handler(req, res) {
    var _a, _b, _c, _d, _e;
    try {
        const collectionSlug = typeof ((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.collection) === 'string' ? req.query.collection : undefined;
        const where = (((_b = req.query) === null || _b === void 0 ? void 0 : _b.where) ? req.query.where : undefined);
        const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined;
        const fallbackLocale = typeof req.query.fallbackLocale === 'string' ? req.query.fallbackLocale : undefined;
        switch (req.method) {
            case 'GET': {
                const limit = (0, isNumber_1.isNumber)((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.limit) ? Number(req.query.limit) : undefined;
                const page = (0, isNumber_1.isNumber)((_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.page) ? Number(req.query.page) : undefined;
                const sort = typeof ((_e = req === null || req === void 0 ? void 0 : req.query) === null || _e === void 0 ? void 0 : _e.sort) === 'string' ? req.query.sort : undefined;
                const result = await req.payload.find({
                    req,
                    collection: collectionSlug,
                    locale,
                    fallbackLocale,
                    where,
                    page,
                    limit,
                    sort,
                    depth: Number(req.query.depth),
                    draft: req.query.draft === 'true',
                    overrideAccess: false,
                });
                return res.status(http_status_1.default.OK).json(result);
            }
            case 'PATCH': {
                const result = await req.payload.update({
                    user: req.user,
                    collection: collectionSlug,
                    locale,
                    fallbackLocale,
                    data: req.body,
                    where,
                    depth: parseInt(String(req.query.depth), 10),
                    draft: req.query.draft === 'true',
                    overrideAccess: false,
                    file: req.files && req.files.file ? req.files.file : undefined,
                });
                return res.status(200).json(result);
            }
            case 'DELETE': {
                const result = await req.payload.delete({
                    user: req.user,
                    collection: collectionSlug,
                    locale,
                    fallbackLocale,
                    where,
                    depth: parseInt(String(req.query.depth), 10),
                    overrideAccess: false,
                });
                return res.status(200).json(result);
            }
            case 'POST': {
                const doc = await req.payload.create({
                    req,
                    collection: collectionSlug,
                    locale,
                    fallbackLocale,
                    data: req.body,
                    depth: Number(req.query.depth),
                    draft: req.query.draft === 'true',
                    overrideAccess: false,
                    file: req.files && req.files.file ? req.files.file : undefined,
                });
                const collection = req.payload.collections[collectionSlug];
                return res.status(http_status_1.default.CREATED).json({
                    ...(0, formatSuccess_1.default)(req.i18n.t('general:successfullyCreated', { label: (0, getTranslation_1.getTranslation)(collection.config.labels.singular, req.i18n) }), 'message'),
                    doc,
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
exports.default = (0, withPayload_1.default)((0, dataLoader_1.default)((0, fileUpload_1.default)((0, qsMiddleware_1.default)((0, convertPayloadJSONBody_1.default)((0, i18n_1.default)((0, initializePassport_1.default)((0, authenticate_1.default)(handler))))))));
//# sourceMappingURL=index.js.map