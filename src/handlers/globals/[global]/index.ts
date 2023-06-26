import { Response } from 'express'
import { PayloadRequest } from 'payload/dist/types'
import httpStatus from 'http-status'
import formatSuccessResponse from 'payload/dist/express/responses/formatSuccess'
import NotFound from 'payload/dist/errors/NotFound'
import { getTranslation } from 'payload/dist/utilities/getTranslation'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import withPayload from '../../../middleware/withPayload'
import convertPayloadJSONBody from '../../../middleware/convertPayloadJSONBody'
import authenticate from '../../../middleware/authenticate'
import initializePassport from '../../../middleware/initializePassport'
import i18n from '../../../middleware/i18n'
import fileUpload from '../../../middleware/fileUpload'
import withDataLoader from '../../../middleware/dataLoader'
import { isNumber } from '../../../utilities/isNumber'

async function handler(req: PayloadRequest, res: Response) {
  try {
    const globalConfig = req.payload.globals.config.find(global => global.slug === req.query.global)
    if (!globalConfig) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Global not found',
      })
    }

    const slug = typeof req.query.global === 'string' ? req.query.global : undefined
    const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined
    const fallbackLocale = typeof req.query.fallbackLocale === 'string' ? req.query.fallbackLocale : undefined

    switch (req.method) {
      case 'GET': {
        const result = await req.payload.findGlobal({
          fallbackLocale,
          user: req.user,
          draft: req.query.draft === 'true',
          showHiddenFields: false,
          overrideAccess: false,
          slug,
          depth: isNumber(req?.query?.depth) ? Number(req.query.depth) : 1,
          locale,
        })

        return res.status(httpStatus.OK).json(result)
      }

      case 'POST': {
        const global = await req.payload.updateGlobal({
          slug,
          locale,
          fallbackLocale,
          data: req.body,
          user: req.user,
          overrideAccess: false,
          showHiddenFields: false,
          draft: req.query.draft === 'true',
          depth: isNumber(req?.query?.depth) ? Number(req.query.depth) : 1,
        })

        return res.status(httpStatus.OK).json({
          ...formatSuccessResponse(req.i18n.t('general:updatedSuccessfully', { label: getTranslation(globalConfig.label, req.i18n) }), 'message'),
          result: global,
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
      convertPayloadJSONBody(
        i18n(
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
