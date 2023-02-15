import { getPayload as getPayloadLocal } from 'payload/dist/payload'

// Need to statically import config to get Next to pick up on it
import config from './payload/payload.config'

const getPayload = async () => {
  return getPayloadLocal({
    mongoURL: process.env.MONGODB_URI as string,
    secret: process.env.PAYLOAD_SECRET as string,
    config,
  })
}


export default getPayload