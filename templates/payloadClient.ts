import { Payload, getPayload } from "payload/dist/payload";
import config from './payload.config';

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET environment variable is missing')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 * 
 * Source: https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.js
 */
let cached: {
  client: Payload | null,
  promise: Promise<Payload> | null
} = (global as any).payload

if (!cached) {
  cached = (global as any).payload = { client: null, promise: null }
}

export const getPayloadClient = async (): Promise<Payload> => {
  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    cached.promise = getPayload({
      // Make sure that your environment variables are filled out accordingly
      secret: process.env.PAYLOAD_SECRET as string,
      config: config,
    })
  }

  try {
    cached.client = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.client
};

export default getPayloadClient;