import { Response } from 'express'
import httpStatus from 'http-status'
import { PayloadRequest } from 'payload/dist/types'
import initOperation from 'payload/dist/auth/operations/init'
import withPayload from '../../middleware/withPayload'

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

  const Model = req.payload.collections[req.query.collection].Model
  const initialized = await initOperation({ req, Model })
  return res.status(httpStatus.OK).json({ initialized })
}

export default withPayload(handler)

export const config = {
  api: {
    externalResolver: true
  }
}