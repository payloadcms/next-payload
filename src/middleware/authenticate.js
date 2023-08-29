const passport = require("passport");
const AnonymousStrategy = require("passport-anonymous");
const authenticate = require("payload/dist/express/middleware/authenticate").default;
const jwtStrategy = require("payload/dist/auth/strategies/jwt").default;
const apiKeyStrategy = require("payload/dist/auth/strategies/apiKey").default;

const authMiddleware = (handler) => (req, res) => {
  passport.use(new AnonymousStrategy.Strategy());
  passport.use("jwt", jwtStrategy(req.payload));

  Object.entries(req.payload.collections).forEach(([slug, collection]) => {
    const { config } = collection;

    if (config.auth) {
      if (config.auth.useAPIKey) {
        passport.use(
          `${config.slug}-api-key`,
          apiKeyStrategy(req.payload, collection)
        );
      }

      if (Array.isArray(config.auth.strategies)) {
        config.auth.strategies.forEach(({ name, strategy }, index) => {
          const passportStrategy =
            typeof strategy === "object" ? strategy : strategy(req.payload);
          passport.use(`${config.slug}-${name ?? index}`, passportStrategy);
        });
      }
    }
  });

  passport.initialize();

  return authenticate(req.payload.config)(req, res, () => handler(req, res));
};

module.exports = authMiddleware;
