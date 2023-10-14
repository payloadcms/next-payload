import httpStatus from 'http-status'
import { Response } from 'express'
import { PayloadRequest, Where } from 'payload/dist/types'
import { getTranslation } from 'payload/dist/utilities/getTranslation'
import NotFound from 'payload/dist/errors/NotFound'
import formatSuccessResponse from 'payload/dist/express/responses/formatSuccess'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import withPayload from '../../middleware/withPayload'
import convertPayloadJSONBody from '../../middleware/convertPayloadJSONBody'
import withAuth from '../../middleware/authenticate'
import i18n from '../../middleware/i18n'
import fileUpload from '../../middleware/fileUpload'
import withDataLoader from '../../middleware/dataLoader'
import { isNumber } from '../../utilities/isNumber'
import withQs from '../../middleware/qsMiddleware'

async function handler(req: PayloadRequest, res: Response) {
  try {
    const collectionSlug = typeof req?.query?.collection === 'string' ? req.query.collection : undefined;
    const where = (req.query?.where ? req.query.where : undefined) as Where;
    const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined
    const fallbackLocale = typeof req.query.fallbackLocale === 'string' ? req.query.fallbackLocale : undefined
    const sort = typeof req?.query?.sort === 'string' ? req.query.sort : undefined;
    const limit = isNumber(req?.query?.limit) ? Number(req.query.limit) : undefined;
    const page = isNumber(req?.query?.page) ? Number(req.query.page) : undefined;
    const depth = isNumber(req?.query?.depth) ? Number(req.query.depth) : undefined;

    switch (req.method) {
      case 'GET': {
        const result = await req.payload.find({
          req,
          collection: collectionSlug,
          locale,
          fallbackLocale,
          where,
          page,
          limit,
          sort,
          depth,
          draft: req.query.draft === 'true',
          overrideAccess: false,
        })

        return res.status(httpStatus.OK).json(result)
      }

      case 'PATCH': {
        const result = await req.payload.update({
          user: req.user,
          collection: collectionSlug,
          locale,
          fallbackLocale,
          data: req.body,
          where,
          depth,
          draft: req.query.draft === 'true',
          overrideAccess: false,
          file: req.files && req.files.file ? req.files.file : undefined,
        })

        return res.status(200).json(result)
      }

      case 'DELETE': {
        const result = await req.payload.delete({
          user: req.user,
          collection: collectionSlug,
          locale,
          fallbackLocale,
          where,
          depth,
          overrideAccess: false,
        })

        return res.status(200).json(result)
      }

      case 'POST': {
        const doc = await req.payload.create({
          req,
          collection: collectionSlug,
          locale,
          fallbackLocale,
          data: req.body,
          depth,
          draft: req.query.draft === 'true',
          overrideAccess: false,
          file: req.files && req.files.file ? req.files.file : undefined,
        })

        const collection = req.payload.collections[collectionSlug]

        return res.status(httpStatus.CREATED).json({
          ...formatSuccessResponse(req.i18n.t('general:successfullyCreated', { label: getTranslation(collection.config.labels.singular, req.i18n) }), 'message'),
          doc,
        })
      }
    }
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }

  return res.status(httpStatus.NOT_FOUND).json(new NotFound(req.t))
}

export default withPayload(
  withDataLoader(
    fileUpload(
      withQs(
        convertPayloadJSONBody(
          i18n(
            withAuth(
              handler
            )
          )
        )
      )
    )
  )
)
