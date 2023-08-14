import httpStatus from 'http-status';
import { Response } from 'express'
import { PayloadRequest, Where } from 'payload/dist/types'
import withPayload from '../../../middleware/withPayload'
import withFileUpload from '../../../middleware/fileUpload'
import convertPayloadJSONBody from '../../../middleware/convertPayloadJSONBody'
import i18nMiddleware from '../../../middleware/i18n'
import authenticate from '../../../middleware/authenticate'
import initializePassport from '../../../middleware/initializePassport'
import withDataLoader from '../../../middleware/dataLoader'
import { isNumber } from '../../../utilities/isNumber'

async function handler(req: PayloadRequest, res: Response) {
  const collectionSlug = typeof req?.query?.collection === 'string' ? req.query.collection : undefined;
  const where = (req.query?.where ? req.query.where : undefined) as Where;
  const sort = typeof req?.query?.sort === 'string' ? req.query.sort : undefined;
  const limit = isNumber(req?.query?.limit) ? Number(req.query.limit) : undefined;
  const page = isNumber(req?.query?.page) ? Number(req.query.page) : undefined;
  const depth = isNumber(req?.query?.depth) ? Number(req.query.depth) : undefined;

  const result = await req.payload.findVersions({
    collection: collectionSlug,
    where,
    page,
    limit,
    sort,
    depth,
  });

  return res.status(httpStatus.OK).json(result);
}

export default withPayload(
  withDataLoader(
    withFileUpload(
      convertPayloadJSONBody(
        i18nMiddleware(
          initializePassport(
            authenticate(
              handler
            )
          )
        )
      )
    )
  )
)