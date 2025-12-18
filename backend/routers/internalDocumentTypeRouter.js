const express = require("express");
const { internalDocumentTypeGet, 
  internalDocumentTypePostCreate, 
  internalDocumentTypePostDelete, 
  internalDocumentTypePostUpdate } = require('../controllers/internalDocumentTypeController');

const internalDocumentTypeRouter = express.Router();

internalDocumentTypeRouter.get("/", internalDocumentTypeGet);
internalDocumentTypeRouter.post("/delete/:id", internalDocumentTypePostDelete);
internalDocumentTypeRouter.post("/create", internalDocumentTypePostCreate);
internalDocumentTypeRouter.post("/update", internalDocumentTypePostUpdate);

module.exports = {
  internalDocumentTypeRouter
}