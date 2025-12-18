const express = require("express");
const { internalDocumentGet, 
  internalDocumentPostCreate, 
  internalDocumentPostDelete, 
  internalDocumentPostUpdate } = require('../controllers/internalDocumentController');

const internalDocumentRouter = express.Router();

internalDocumentRouter.get("/", internalDocumentGet);
internalDocumentRouter.post("/delete", internalDocumentPostDelete);
internalDocumentRouter.post("/create", internalDocumentPostCreate);
internalDocumentRouter.post("/update", internalDocumentPostUpdate);

module.exports = {
  internalDocumentRouter
}