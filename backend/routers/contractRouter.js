const express = require("express");
const { contractGet, 
  contractPostCreate, 
  contractPostDelete, 
  contractPostUpdate } = require('../controllers/contractController');

const contractRouter = express.Router();

contractRouter.get("/", contractGet);
contractRouter.post("/delete", contractPostDelete);
contractRouter.post("/create", contractPostCreate);
contractRouter.post("/update", contractPostUpdate);

module.exports = {
  contractRouter
}