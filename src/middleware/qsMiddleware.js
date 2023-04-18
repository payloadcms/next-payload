const QueryString = require("qs");

const withQs = (handler) => (req, res) => {
  const paramsFromURL = req.url.split("?")[1] || "";
  req.query = {
    ...req.query,
    ...(paramsFromURL ? QueryString.parse(paramsFromURL) : {}),
  };

  return handler(req, res);
};

module.exports = withQs;
