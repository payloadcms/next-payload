import { getDataLoader } from 'payload/dist/collections/dataloader';

const dataLoader = (handler) => (req, res) => {
  req.payloadDataLoader = getDataLoader(req);
  handler(req, res)
}

export default dataLoader