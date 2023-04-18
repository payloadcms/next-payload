import { Response } from 'express'
import { PayloadRequest } from 'payload/dist/types'
import httpStatus from 'http-status'
import logout from 'payload/dist/auth/operations/logout'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import withPayload from '../../middleware/withPayload'
import convertPayloadJSONBody from '../../middleware/convertPayloadJSONBody'
import initializePassport from '../../middleware/initializePassport'
import authenticate from '../../middleware/authenticate'
import withCookie from '../../middleware/cookie'

async function handler(req: PayloadRequest, res: Response) {
  if (typeof req.query.collection !== 'string') {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Collection not specified',
    })
  }

  if (!req.payload.collections?.[req.query.collection]) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Collection not found',
    })
  }

  try {
    const message = await logout({
      collection: req.payload.collections[req.query.collection],
      res,
      req,
    });

    return res.status(httpStatus.OK).json({ message });
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }
}

export default withPayload(
  convertPayloadJSONBody(
    initializePassport(
      authenticate(
        withCookie(
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