import authenticate from 'payload/dist/express/middleware/authenticate'

const authMiddleware = (handler) => (req, res) => {
  // Need to backfill req.get -
  // it's relied on within payload auth to retrieve auth headers
  req.get = (headerName) => req.headers[headerName.toLowerCase()]

  authenticate(req.payload.config)(req, res, () =>
    handler(req, res)
  )
}

export default authMiddleware