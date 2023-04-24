import { Response } from 'express'
import httpStatus from 'http-status'
import { PayloadRequest } from 'payload/dist/types'
import { docAccess } from 'payload/dist/globals/operations/docAccess'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import authenticate from '../../../middleware/authenticate'
import initializePassport from '../../../middleware/initializePassport'
import withPayload from '../../../middleware/withPayload'
import withDataLoader from '../../../middleware/dataLoader'

async function handler(req: PayloadRequest, res: Response) {
  const globalConfig = req.payload.globals.config.find(global => global.slug === req.query.global)

  try {
    const globalAccessResult = await docAccess({
      req,
      globalConfig,
    })
    return res.status(httpStatus.OK).json(globalAccessResult)
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }
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