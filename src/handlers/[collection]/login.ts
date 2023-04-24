import { Response } from 'express'
import { PayloadRequest } from 'payload/dist/types'
import httpStatus from 'http-status'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import login from 'payload/dist/auth/operations/login'
import withPayload from '../../middleware/withPayload'
import convertPayloadJSONBody from '../../middleware/convertPayloadJSONBody'
import withCookie from '../../middleware/cookie'
import fileUpload from '../../middleware/fileUpload'
import withDataLoader from '../../middleware/dataLoader'

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
    const result = await login({
      req,
      res,
      collection: req.payload.collections[req.query.collection],
      data: req.body,
      depth: parseInt(String(req.query.depth), 10),
    })

    return res.status(httpStatus.OK)
      .json({
        message: 'Auth Passed',
        user: result.user,
        token: result.token,
        exp: result.exp,
      });
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }
}

export default withPayload(
  withDataLoader(
    fileUpload(
      convertPayloadJSONBody(
        withCookie(
          handler
        )
      )
    )
  )
)
