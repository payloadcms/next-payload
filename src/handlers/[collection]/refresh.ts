import httpStatus from 'http-status'
import refresh from 'payload/dist/auth/operations/refresh'
import getExtractJWT from 'payload/dist/auth/getExtractJWT'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import withPayload from '../../middleware/withPayload'
import convertPayloadJSONBody from '../../middleware/convertPayloadJSONBody'
import fileUpload from '../../middleware/fileUpload'
import withDataLoader from '../../middleware/dataLoader'
import withCookie from '../../middleware/cookie'
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

    const result = await refresh({
      req,
      res,
      collection: req.payload.collections[req.query.collection],
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
    fileUpload(
      convertPayloadJSONBody(
        withCookie(
          handler
        )
      )
    )
  )
)
