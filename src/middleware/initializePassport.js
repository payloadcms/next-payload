const passport = require("passport");
const jwtStrategy = require("payload/dist/auth/strategies/jwt").default;
const apiKeyStrategy = require("payload/dist/auth/strategies/apiKey").default;
const AnonymousStrategy = require("passport-anonymous");

const initializePassport = (handler) => (req, res) => {
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

  return passport.initialize()(req, res, () => handler(req, res));
};

module.exports = initializePassport;
