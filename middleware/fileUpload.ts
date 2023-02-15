import fileUpload from 'express-fileupload'
import express from 'express'

const withFileUpload = (handler) => (req, res) => {
  express.json(req.payload.config.express.json)(req, res, () =>
    fileUpload({
      parseNested: true,
      ...req.payload.config.upload,
      //@ts-ignore
    })(req, res, () => handler(req, res))
  )
}


export default withFileUpload