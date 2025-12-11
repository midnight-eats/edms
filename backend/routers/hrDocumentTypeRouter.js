const express = require("express");
const { hrDocumentTypeGet, 
  hrDocumentTypePostCreate, 
  hrDocumentTypePostDelete, 
  hrDocumentTypePostUpdate } = require('../controllers/hrDocumentTypeController');

const hrDocumentTypeRouter = express.Router();

hrDocumentTypeRouter.get("/", hrDocumentTypeGet);
hrDocumentTypeRouter.post("/delete/:id", hrDocumentTypePostDelete);
hrDocumentTypeRouter.post("/create", hrDocumentTypePostCreate);
hrDocumentTypeRouter.post("/update", hrDocumentTypePostUpdate);

module.exports = {
  hrDocumentTypeRouter
}