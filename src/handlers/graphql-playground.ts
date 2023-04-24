import { Response } from 'express'
import { PayloadRequest } from 'payload/dist/types'
import graphQLPlayground from 'graphql-playground-middleware-express'
import withPayload from '../middleware/withPayload'

async function handler(req: PayloadRequest, res: Response) {
  return graphQLPlayground({
    endpoint: `${req.payload.config.routes.api}${req.payload.config.routes.graphQL}`,
    settings: {
      'request.credentials': 'include'
    }
  })(req, res, () => null)
}

export default withPayload(
  handler
)