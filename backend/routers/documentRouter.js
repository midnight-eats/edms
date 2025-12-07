const express = require("express");
const { documentGet, 
  documentPostCreate, 
  documentPostDelete, 
  documentPostUpdate } = require('../controllers/documentController');

const documentRouter = express.Router();

documentRouter.get("/", documentGet);
//documentRouter.post("/delete/:id", documentPostDelete);
documentRouter.post("/create", documentPostCreate);
//documentRouter.post("/update", documentPostUpdate);

module.exports = {
  documentRouter
}