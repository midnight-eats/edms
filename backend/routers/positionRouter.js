const express = require("express");
const { positionGet, 
  positionPostCreate, 
  positionPostDelete, 
  positionPostUpdate } = require('../controllers/positionController');
const { User } = require("../models/user.js")

const positionRouter = express.Router();

positionRouter.get("/", positionGet);
positionRouter.post("/delete/:id", positionPostDelete);
positionRouter.post("/create", positionPostCreate);
positionRouter.post("/update", positionPostUpdate);

module.exports = {
  positionRouter
}