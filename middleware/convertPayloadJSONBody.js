const convertPayloadJSONBody = (handler) => (req, res) => {
  if (req.body && req.body._payload) {
    const payloadJSON = JSON.parse(req.body._payload)
    req.body = {
      ...req.body,
      ...payloadJSON
    }

    delete req.body._payload
  }

  handler(req, res)
}

module.exports = convertPayloadJSONBody