import httpStatus from 'http-status'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import registerFirstUser from 'payload/dist/auth/operations/registerFirstUser'
import withPayload from '../../middleware/withPayload'
import convertPayloadJSONBody from '../../middleware/convertPayloadJSONBody'
import fileUpload from '../../middleware/fileUpload'
import withCookies from '../../middleware/cookie'
import withDataLoader from '../../middleware/dataLoader'
import { PayloadRequest } from 'payload/dist/types'
import { Response } from 'express'

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
    const firstUser = await registerFirstUser({
      req,
      res,
      collection: req.payload.collections[req.query.collection],
      data: req.body,
    })

    return res.status(httpStatus.OK).json(firstUser)
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  }
}

export default withPayload(
  withDataLoader(
    fileUpload(
      withCookies(
        convertPayloadJSONBody(
          handler
        )
      )
    )
  )
)
