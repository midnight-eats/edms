const express = require("express");
const { administrativeDocumentGet, 
  administrativeDocumentPostCreate, 
  administrativeDocumentPostDelete, 
  administrativeDocumentPostUpdate } = require('../controllers/administrativeDocumentController');

const administrativeDocumentRouter = express.Router();

administrativeDocumentRouter.get("/", administrativeDocumentGet);
administrativeDocumentRouter.post("/delete", administrativeDocumentPostDelete);
administrativeDocumentRouter.post("/create", administrativeDocumentPostCreate);
administrativeDocumentRouter.post("/update", administrativeDocumentPostUpdate);

module.exports = {
  administrativeDocumentRouter
}