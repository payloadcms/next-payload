import handler from '@payloadcms/next-payload/dist/handlers/[collection]/versions/[id]'

export default handler

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  }
}