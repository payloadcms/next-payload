const getPayload = require("@payloadcms/next-payload/getPayload").default;

const withPayload = (handler) => async (req, res) => {
  // Need to backfill req.get -
  // it's relied on within payload
  req.get = (headerName) => req.headers[headerName.toLowerCase()];
  req.payload = await getPayload();
  return handler(req, res);
};

module.exports = withPayload;
