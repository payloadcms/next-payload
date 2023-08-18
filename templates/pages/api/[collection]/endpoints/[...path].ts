import handler from '@payloadcms/next-payload/dist/handlers/[collection]/endpoints/[...path]'

export default handler

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  }
}