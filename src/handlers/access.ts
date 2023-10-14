import { Response } from 'express'
import httpStatus from 'http-status'
import { PayloadRequest } from 'payload/dist/types'
import access from 'payload/dist/auth/operations/access'
import authenticate from '../middleware/authenticate'
import withPayload from '../middleware/withPayload'

async function handler(req: PayloadRequest, res: Response) {
  const accessResult = await access({
    req,
  })

  return res.status(httpStatus.OK).json(accessResult)
}

export default withPayload(
  authenticate(
    handler
  )
)

