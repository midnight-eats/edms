const express = require("express");
const { counterpartyGet, 
  counterpartyPostCreate, 
  counterpartyPostDelete, 
  counterpartyPostUpdate  } = require('../controllers/counterpartyController');

const counterpartyRouter = express.Router();

counterpartyRouter.get("/", counterpartyGet);
counterpartyRouter.post("/delete/:id", counterpartyPostDelete);
counterpartyRouter.post("/create", counterpartyPostCreate);
counterpartyRouter.post("/update", counterpartyPostUpdate);

module.exports = {
  counterpartyRouter
}