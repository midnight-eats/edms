const express = require("express");
const { deliveryMethodGet, 
  deliveryMethodPostCreate, 
  deliveryMethodPostDelete, 
  deliveryMethodPostUpdate  } = require('../controllers/deliveryMethodController');

const deliveryMethodRouter = express.Router();

deliveryMethodRouter.get("/", deliveryMethodGet);
deliveryMethodRouter.post("/delete/:id", deliveryMethodPostDelete);
deliveryMethodRouter.post("/create", deliveryMethodPostCreate);
deliveryMethodRouter.post("/update", deliveryMethodPostUpdate);

module.exports = {
  deliveryMethodRouter
}