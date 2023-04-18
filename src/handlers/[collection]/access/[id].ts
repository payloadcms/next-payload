import httpStatus from 'http-status'
import { docAccess } from 'payload/dist/collections/operations/docAccess'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import authenticate from '../../../middleware/authenticate'
import initializePassport from '../../../middleware/initializePassport'
import withPayload from '../../../middleware/withPayload'
import withDataLoader from '../../../middleware/dataLoader'

async function handler(req, res) {

  try {
    const docAccessResult = await docAccess({
      id: req.query.id,
      req: {
        ...req,
        collection: req.payload.collections[req.query.collection],
      }
    })
    return res.status(httpStatus.OK).json(docAccessResult)
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

export const config = {
  api: {
    externalResolver: true
  }
}