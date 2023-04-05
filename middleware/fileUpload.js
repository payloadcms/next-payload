const fileUpload = require("express-fileupload");
const express = require("express");

const withFileUpload = (handler) => (req, res) => {
  return express.json(req.payload.config.express.json)(req, res, () =>
    fileUpload({
      parseNested: true,
      ...req.payload.config.upload,
      //@ts-ignore
    })(req, res, () => handler(req, res))
  );
};

module.exports = withFileUpload;
