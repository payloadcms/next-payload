import passport from 'passport'
import jwtStrategy from 'payload/dist/auth/strategies/jwt'
import AnonymousStrategy from 'passport-anonymous'

const initializePassport = (handler) => (req, res) => {
  passport.use(new AnonymousStrategy.Strategy())
  passport.use('jwt', jwtStrategy(req.payload))

  passport.initialize()(req, res, () =>
    handler(req, res)
  )
}

export default initializePassport