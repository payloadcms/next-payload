"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const http_status_1 = __importDefault(require("http-status"));
const NotFound_1 = __importDefault(require("payload/dist/errors/NotFound"));
const update_1 = __importDefault(require("payload/dist/preferences/operations/update"));
const errorHandler_1 = __importDefault(require("payload/dist/express/middleware/errorHandler"));
const delete_1 = __importDefault(require("payload/dist/preferences/operations/delete"));
const findOne_1 = __importDefault(require("payload/dist/preferences/operations/findOne"));
const formatSuccess_1 = __importDefault(require("payload/dist/express/responses/formatSuccess"));
const convertPayloadJSONBody_1 = __importDefault(require("../../middleware/convertPayloadJSONBody"));
const withPayload_1 = __importDefault(require("./../../middleware/withPayload"));
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const initializePassport_1 = __importDefault(require("../../middleware/initializePassport"));
const i18n_1 = __importDefault(require("../../middleware/i18n"));
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const dataLoader_1 = __importDefault(require("../../middleware/dataLoader"));
async function handler(req, res) {
    var _a, _b;
    try {
        const collectionSlug = typeof ((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.collection) === 'string' ? req.query.collection : undefined;
        const id = typeof ((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.id) === 'string' ? req.query.id : undefined;
        const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined;
        const fallbackLocale = typeof req.query.fallbackLocale === 'string' ? req.query.fallbackLocale : undefined;
        // Unfortunately,
        // There is a route collision between /api/_preferences/[key].js
        // and /api/[collection]/[id].js
        // so both need to be handled in this file for now
        if (collectionSlug === '_preferences') {
            const key = typeof req.query.id === 'string' ? req.query.id : undefined;
            switch (req.method) {
                case 'GET': {
                    const result = await (0, findOne_1.default)({
                        req,
                        user: req.user,
                        key,
                    });
                    return res.status(http_status_1.default.OK).json(result || { message: req.t('general:notFound'), value: null });
                }
                case 'POST': {
                    const doc = await (0, update_1.default)({
                        req,
                        user: req.user,
                        key,
                        value: req.body.value || req.body,
                    });
                    return res.status(http_status_1.default.OK).json({
                        ...(0, formatSuccess_1.default)(req.t('general:updatedSuccessfully'), 'message'),
                        doc,
                    });
                }
                case 'DELETE': {
                    await (0, delete_1.default)({
                        req,
                        user: req.user,
                        key,
                    });
                    return res.status(http_status_1.default.OK).json({
                        ...(0, formatSuccess_1.default)(req.t('deletedSuccessfully'), 'message'),
                    });
                }
            }
        }
        if (collectionSlug && req.payload.collections[collectionSlug] === undefined) {
            return res.status(http_status_1.default.BAD_REQUEST).json({
                message: 'Collection not found',
            });
        }
        switch (req.method) {
            case 'GET': {
                const doc = await req.payload.findByID({
                    req,
                    collection: collectionSlug,
                    id,
                    locale,
                    fallbackLocale,
                    depth: Number(req.query.depth),
                    overrideAccess: false,
                    draft: req.query.draft === 'true',
                });
                return res.status(http_status_1.default.OK).json(doc);
            }
            case 'PATCH': {
                const draft = req.query.draft === 'true';
                const autosave = req.query.autosave === 'true';
                const doc = await req.payload.update({
                    user: req.user,
                    collection: collectionSlug,
                    id,
                    data: req.body,
                    depth: parseInt(String(req.query.depth), 10),
                    locale,
                    fallbackLocale,
                    draft,
                    autosave,
                    overrideAccess: false,
                    file: req.files && req.files.file ? req.files.file : undefined
                });
                let message = req.t('general:updatedSuccessfully');
                if (draft)
                    message = req.t('versions:draftSavedSuccessfully');
                if (autosave)
                    message = req.t('versions:autosavedSuccessfully');
                return res.status(http_status_1.default.OK).json({
                    ...(0, formatSuccess_1.default)(message, 'message'),
                    doc,
                });
            }
            case 'DELETE': {
                const doc = await req.payload.delete({
                    user: req.user,
                    collection: collectionSlug,
                    id,
                    locale,
                    fallbackLocale,
                    depth: parseInt(String(req.query.depth), 10),
                    overrideAccess: false,
                });
                if (!doc) {
                    return res.status(http_status_1.default.NOT_FOUND).json(new NotFound_1.default(req.t));
                }
                return res.status(http_status_1.default.OK).send(doc);
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
//# sourceMappingURL=%5Bid%5D.js.map