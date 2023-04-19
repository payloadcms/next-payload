const { i18nMiddleware } = require("payload/dist/express/middleware/i18n");
const withI18N = (handler) => (req, res) => {
    return i18nMiddleware(req.payload.config.i18n)(req, res, () => handler(req, res));
};
module.exports = withI18N;
//# sourceMappingURL=i18n.js.map