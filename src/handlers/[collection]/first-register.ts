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
  const collectionSlug = req.query.collection as string;

  if (!req.payload.collections?.[collectionSlug]) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Collection not found',
    })
  }

  try {
    const firstUser = await registerFirstUser({
      req,
      res,
      collection: req.payload.collections[collectionSlug],
      data: req.body,
    })

    return res.status(httpStatus.OK).json(firstUser)
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
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
