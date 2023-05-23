import { Response } from 'express'
import httpStatus from 'http-status'
import { PayloadRequest } from 'payload/dist/types'
import verifyEmail from 'payload/dist/auth/operations/verifyEmail'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import withPayload from '../../../middleware/withPayload'
import convertPayloadJSONBody from '../../../middleware/convertPayloadJSONBody'
import fileUpload from '../../../middleware/fileUpload'
import i18n from '../../../middleware/i18n'

async function handler(req: PayloadRequest, res: Response) {
  const collectionSlug = req.query.collection as string;
  const token = req.query.token as string;

  if (!req.payload.collections?.[collectionSlug]) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Collection not found',
    })
  }

  try {
    await verifyEmail({
      collection: req.payload.collections[collectionSlug],
      token: token as string,
    });

    return res.status(httpStatus.OK)
      .json({
        message: 'Email verified successfully.',
      });
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }
}

export default withPayload(
  fileUpload(
    i18n(
      convertPayloadJSONBody(
        handler
      )
    )
  )
)
