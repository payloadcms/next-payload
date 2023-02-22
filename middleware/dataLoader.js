const { getDataLoader } = require('payload/dist/collections/dataloader');

const dataLoader = (handler) => (req, res) => {
  req.payloadDataLoader = getDataLoader(req);
  handler(req, res)
}

module.exports = dataLoader