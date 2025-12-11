const express = require("express");
const { contractTypeGet, 
  contractTypePostCreate, 
  contractTypePostDelete, 
  contractTypePostUpdate  } = require('../controllers/contractTypeController');

const contractTypeRouter = express.Router();

contractTypeRouter.get("/", contractTypeGet);
contractTypeRouter.post("/delete/:id", contractTypePostDelete);
contractTypeRouter.post("/create", contractTypePostCreate);
contractTypeRouter.post("/update", contractTypePostUpdate);

module.exports = {
  contractTypeRouter
}