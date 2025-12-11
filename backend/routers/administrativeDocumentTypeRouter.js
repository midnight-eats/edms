const express = require("express");
const { administrativeDocumentTypeGet, 
  administrativeDocumentTypePostCreate, 
  administrativeDocumentTypePostDelete, 
  administrativeDocumentTypePostUpdate  } = require('../controllers/administrativeDocumentTypeController');

const administrativeDocumentTypeRouter = express.Router();

administrativeDocumentTypeRouter.get("/", administrativeDocumentTypeGet);
administrativeDocumentTypeRouter.post("/delete/:id", administrativeDocumentTypePostDelete);
administrativeDocumentTypeRouter.post("/create", administrativeDocumentTypePostCreate);
administrativeDocumentTypeRouter.post("/update", administrativeDocumentTypePostUpdate);

module.exports = {
  administrativeDocumentTypeRouter
}