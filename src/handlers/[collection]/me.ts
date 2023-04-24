import { Response } from 'express'
import httpStatus from 'http-status'
import { PayloadRequest } from 'payload/dist/types'
import meOperation from 'payload/dist/auth/operations/me'
import withPayload from '../../middleware/withPayload'
import authenticate from '../../middleware/authenticate'
import initializePassport from '../../middleware/initializePassport'
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

  const collection = req.payload.collections[req.query.collection]
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