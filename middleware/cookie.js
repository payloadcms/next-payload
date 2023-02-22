const { serialize } = require('cookie')

/**
 * This sets `cookie` on `res` object
 */
const cookie = (res, name, value, options = {}) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (typeof options.maxAge === 'number') {
    options.expires = new Date(Date.now() + options.maxAge)
    options.maxAge /= 1000
  }

  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options))
}
/**
 * This sets `clearCookie` on `res` object
 */
const clearCookie = (res, name, options) => {
  res.setHeader('Set-Cookie', serialize(name, '', options))
}

/**
 * Adds `cookie` and `clearCookie` function on `res.cookie` to set cookies for response
 */
const cookies = (handler) => (req, res) => {
  res.cookie = (name, value, options) => cookie(res, name, value, options)
  res.clearCookie = (name, options) => clearCookie(res, name, options)

  return handler(req, res)
}

module.exports = cookies