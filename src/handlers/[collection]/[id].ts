import { Response } from 'express'
import httpStatus from 'http-status'
import { PayloadRequest } from 'payload/dist/types'
import NotFound from 'payload/dist/errors/NotFound'
import updatePreference from 'payload/dist/preferences/operations/update'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import deletePreference from 'payload/dist/preferences/operations/delete'
import findPreference from 'payload/dist/preferences/operations/findOne'
import formatSuccessResponse from 'payload/dist/express/responses/formatSuccess'
import convertPayloadJSONBody from '../../middleware/convertPayloadJSONBody'
import withPayload from './../../middleware/withPayload'
import authenticate from '../../middleware/authenticate'
import initializePassport from '../../middleware/initializePassport'
import i18n from '../../middleware/i18n'
import fileUpload from '../../middleware/fileUpload'
import withDataLoader from '../../middleware/dataLoader'

async function handler(req: PayloadRequest, res: Response) {
  try {
    const collectionSlug = req.query.collection as string
    const id = req.query.id as string;
    const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined
    const fallbackLocale = typeof req.query.fallbackLocale === 'string' ? req.query.fallbackLocale : undefined

    // Unfortunately,
    // There is a route collision between /api/_preferences/[key].js
    // and /api/[collection]/[id].js
    // so both need to be handled in this file for now
    if (collectionSlug === '_preferences') {
      const key = typeof req.query.id === 'string' ? req.query.id : undefined;

      switch (req.method) {
        case 'GET': {
          const result = await findPreference({
            req,
            user: req.user,
            key,
          });

          return res.status(httpStatus.OK).json(result || { message: req.t('general:notFound'), value: null })
        }

        case 'POST': {
          const doc = await updatePreference({
            req,
            user: req.user,
            key,
            value: req.body.value || req.body,
          });

          return res.status(httpStatus.OK).json({
            ...formatSuccessResponse(req.t('general:updatedSuccessfully'), 'message'),
            doc,
          });
        }

        case 'DELETE': {
          await deletePreference({
            req,
            user: req.user,
            key,
          });

          return res.status(httpStatus.OK).json({
            ...formatSuccessResponse(req.t('deletedSuccessfully'), 'message'),
          });
        }
      }
    }

    if (collectionSlug && req.payload.collections[collectionSlug] === undefined) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Collection not found',
      })
    }

    switch (req.method) {
      case 'GET': {
        const doc = await req.payload.findByID({
          req,
          collection: collectionSlug,
          id,
          locale,
          fallbackLocale,
          depth: Number(req.query.depth),
          overrideAccess: false,
          draft: req.query.draft === 'true',
        })

        return res.status(httpStatus.OK).json(doc)
      }

      case 'PATCH': {
        const draft = req.query.draft === 'true';
        const autosave = req.query.autosave === 'true';

        const doc = await req.payload.update({
          user: req.user,
          collection: collectionSlug,
          id,
          data: req.body,
          depth: parseInt(String(req.query.depth), 10),
          locale,
          fallbackLocale,
          draft,
          autosave,
          overrideAccess: false,
          file: req.files && req.files.file ? req.files.file : undefined
        });

        let message = req.t('general:updatedSuccessfully');

        if (draft) message = req.t('versions:draftSavedSuccessfully');
        if (autosave) message = req.t('versions:autosavedSuccessfully');

        return res.status(httpStatus.OK).json({
          ...formatSuccessResponse(message, 'message'),
          doc,
        });
      }

      case 'DELETE': {
        const doc = await req.payload.delete({
          user: req.user,
          collection: collectionSlug,
          id,
          locale,
          fallbackLocale,
          depth: parseInt(String(req.query.depth), 10),
          overrideAccess: false,
        });

        if (!doc) {
          return res.status(httpStatus.NOT_FOUND).json(new NotFound(req.t));
        }

        return res.status(httpStatus.OK).send(doc);
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
