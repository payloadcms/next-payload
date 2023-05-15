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
import i18n from '../../middleware/i18n'

async function handler(req: PayloadRequest, res: Response) {
  const collectionSlug = req.query.collection as string;

  if (!req.payload.collections?.[collectionSlug]) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Collection not found',
    })
  }

  try {
    const result = await login({
      req,
      res,
      collection: req.payload.collections[collectionSlug],
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
      i18n(
        convertPayloadJSONBody(
          withCookie(
            handler
          )
        )
      )
    )
  )
)
