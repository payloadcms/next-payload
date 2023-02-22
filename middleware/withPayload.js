const getPayload = require('@payloadcms/next-payload/getPayload').default

const withPayload = (handler) => async (req, res) => {
  req.payload = await getPayload()
  handler(req, res)
}

module.exports = withPayload