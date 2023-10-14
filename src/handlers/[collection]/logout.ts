import { Response } from 'express'
import { PayloadRequest } from 'payload/dist/types'
import httpStatus from 'http-status'
import logout from 'payload/dist/auth/operations/logout'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import withPayload from '../../middleware/withPayload'
import convertPayloadJSONBody from '../../middleware/convertPayloadJSONBody'
import withAuth from '../../middleware/authenticate'
import withCookie from '../../middleware/cookie'

async function handler(req: PayloadRequest, res: Response) {
  const collectionSlug = req.query.collection as string;

  if (!req.payload.collections?.[collectionSlug]) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Collection not found',
    })
  }

  try {
    const message = await logout({
      collection: req.payload.collections[collectionSlug],
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
    withAuth(
      withCookie(
        handler
      )
    )
  )
)