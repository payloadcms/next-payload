import { Response } from 'express'
import httpStatus from 'http-status'
import { PayloadRequest } from 'payload/dist/types'
import meOperation from 'payload/dist/auth/operations/me'
import withPayload from '../../middleware/withPayload'
import authenticate from '../../middleware/authenticate'
import initializePassport from '../../middleware/initializePassport'
import withDataLoader from '../../middleware/dataLoader'

async function handler(req: PayloadRequest, res: Response) {
  const collectionSlug = req.query.collection as string;

  if (!req.payload.collections?.[collectionSlug]) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Collection not found',
    })
  }

  const collection = req.payload.collections[collectionSlug]
  const result = await meOperation({ req, collection })
  return res.status(httpStatus.OK).json(result)
}

export default withPayload(
  withDataLoader(
    initializePassport(
      authenticate(
        handler
      )
    )
  )
)