import httpStatus from 'http-status'
import refresh from 'payload/dist/auth/operations/refresh'
import getExtractJWT from 'payload/dist/auth/getExtractJWT'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import withPayload from '../../middleware/withPayload'
import convertPayloadJSONBody from '../../middleware/convertPayloadJSONBody'
import fileUpload from '../../middleware/fileUpload'
import withDataLoader from '../../middleware/dataLoader'
import withCookie from '../../middleware/cookie'
import withAuth from '../../middleware/authenticate'
import { PayloadRequest } from 'payload/dist/types'
import { Response } from 'express'

async function handler(req: PayloadRequest, res: Response) {
  try {
    let token;

    const extractJWT = getExtractJWT(req.payload.config);
    token = extractJWT(req);

    if (req.body.token) {
      token = req.body.token;
    }

    const collectionSlug = req.query.collection as string;

    if (!req.payload.collections?.[collectionSlug]) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Collection not found',
      })
    }

    const result = await refresh({
      req,
      res,
      collection: req.payload.collections[collectionSlug],
      token,
    });

    return res.status(httpStatus.OK).json({
      message: 'Token refresh successful',
      ...result,
    });
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }
}

export default withPayload(
  withDataLoader(
    withAuth(
      fileUpload(
        convertPayloadJSONBody(
          withCookie(
            handler
          )
        )
      )
    )
  )
)
