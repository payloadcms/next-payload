import { getPayload } from "payload/dist/payload";
import config from './payload.config';

export const getInitializedPayload = async () => {
  return getPayload({
    // Make sure that your environment variables are filled out accordingly
    mongoURL: process.env.MONGODB_URI as string,
    secret: process.env.PAYLOAD_SECRET as string,
    config,
  });
};

export default getInitializedPayload;