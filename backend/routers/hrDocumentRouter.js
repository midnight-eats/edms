const express = require("express");
const { hrDocumentGet, 
  hrDocumentPostCreate, 
  hrDocumentPostDelete, 
  hrDocumentPostUpdate } = require('../controllers/hrDocumentController');

const hrDocumentRouter = express.Router();

hrDocumentRouter.get("/", hrDocumentGet);
hrDocumentRouter.post("/delete", hrDocumentPostDelete);
hrDocumentRouter.post("/create", hrDocumentPostCreate);
hrDocumentRouter.post("/update", hrDocumentPostUpdate);

module.exports = {
  hrDocumentRouter
}