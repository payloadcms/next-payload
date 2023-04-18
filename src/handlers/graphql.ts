import { PayloadRequest } from 'payload/dist/types'
import { Response } from 'express'
import httpStatus from 'http-status'
import NotFound from 'payload/dist/errors/NotFound'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import graphQLHandler from 'payload/dist/graphql/graphQLHandler'
import withPayload from '../middleware/withPayload'
import authenticate from '../middleware/authenticate'
import initializePassport from '../middleware/initializePassport'
import i18n from '../middleware/i18n'
import withDataLoader from '../middleware/dataLoader'

async function handler(req: PayloadRequest, res: Response, next) {
  try {
    req.payloadAPI = 'graphQL'

    if (req.method === 'POST') {
      return graphQLHandler(req, res)(req, res)
    }

    if (req.method === 'OPTIONS') {
      res.status(httpStatus.OK)
    }
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }

  return res.status(httpStatus.NOT_FOUND).json(new NotFound(req.t))
}

export default withPayload(
  withDataLoader(
    i18n(
      initializePassport(
        authenticate(
          handler
        )
      )
    )
  )
)

export const config = {
  api: {
    externalResolver: true
  }
}
