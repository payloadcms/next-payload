const passport = require('passport')
const jwtStrategy = require('payload/dist/auth/strategies/jwt')
const AnonymousStrategy = require('passport-anonymous')

const initializePassport = (handler) => (req, res) => {
  passport.use(new AnonymousStrategy.Strategy())
  passport.use('jwt', jwtStrategy(req.payload))

  passport.initialize()(req, res, () =>
    handler(req, res)
  )
}

module.exports = initializePassport