import { timestamp } from '../utilities/timestamp'
import getPayload from '../getPayload'

const withPayload = (handler) => async (req, res) => {
  timestamp('before')
  req.payload = await getPayload()
  timestamp('after')
  handler(req, res)
}

export default withPayload