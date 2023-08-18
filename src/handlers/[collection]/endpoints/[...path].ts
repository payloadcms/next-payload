import authenticate from '../../../middleware/authenticate';
import convertPayloadJSONBody from '../../../middleware/convertPayloadJSONBody';
import withDataLoader from '../../../middleware/dataLoader';
import fileUpload from '../../../middleware/fileUpload';
import i18n from '../../../middleware/i18n';
import initializePassport from '../../../middleware/initializePassport';
import withPayload from '../../../middleware/withPayload';
import { Response } from 'express';
import httpStatus from 'http-status';
import { Endpoint } from 'payload/config';
import NotFound from 'payload/dist/errors/NotFound';
import getErrorHandler from 'payload/dist/express/middleware/errorHandler';
import { PayloadRequest } from 'payload/types';

/**
 * Execute the handler(s) of the given endpoint.
 */
async function executeHandler(
  endpoint: Endpoint,
  req: PayloadRequest,
  res: Response,
) {
  if (Array.isArray(endpoint.handler)) {
    return Promise.all(
      endpoint.handler.map((handler) => {
        return handler(req, res, () => null);
      }),
    );
  } else {
    return endpoint.handler(req, res, () => null);
  }
}

/**
 * Checks if the given request satisfies the handler. If so,
 * it returns the required arguments for the handler.
 *
 * @param expectedEndpoint - The endpoint that is expected to have been called.
 * @param actualRequest - The request that has actually been send.
 */
function isCorrectEndpoint(
  expectedEndpoint: Omit<Endpoint, 'root'>,
  actualRequest: PayloadRequest,
): false | Record<string, any> {
  // Make sure the request method is the expected one
  if (expectedEndpoint.method.toUpperCase() !== actualRequest.method) {
    return false;
  }

  return validatePath(actualRequest, expectedEndpoint);
}

/**
 * Create params and validate that the request belongs to the endpoint.
 * @param req - The request that has been made.
 * @param endpoint - The endpoint to check.
 */
function validatePath(req: PayloadRequest, endpoint: Endpoint) {
  const pathSegments = endpoint.path.split('/').filter(Boolean);
  const params = {};

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];

    if (segment.startsWith(':')) {
      params[segment.substring(1)] = req.query?.path?.[i];
    } else if (segment !== req.query?.path?.[i]) {
      return false;
    }
  }

  return params;
}

async function handler(req: PayloadRequest, res: Response) {
  const collectionSlug = typeof req?.query?.collection === 'string' ? req.query.collection : undefined;

  if (collectionSlug === undefined || req.payload.collections[collectionSlug] === undefined) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Collection not found',
    })
  }

  const { endpoints } = req.payload.collections[collectionSlug].config

  // Catch all errors that could occur in execution of custom handlers.
  try {
    for (const endpoint of endpoints) {
      const params = isCorrectEndpoint(endpoint, req)
  
      if (params !== false) {
        return executeHandler(endpoint, { ...req, params } as PayloadRequest, res)
      }
    }
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null)
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