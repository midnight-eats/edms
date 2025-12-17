const express = require("express");
const { incomingCorrespondenceGet, 
  incomingCorrespondencePostCreate, 
  incomingCorrespondencePostDelete, 
  incomingCorrespondencePostUpdate } = require('../controllers/incomingCorrespondenceController');

const incomingCorrespondenceRouter = express.Router();

incomingCorrespondenceRouter.get("/", incomingCorrespondenceGet);
incomingCorrespondenceRouter.post("/delete", incomingCorrespondencePostDelete);
incomingCorrespondenceRouter.post("/create", incomingCorrespondencePostCreate);
incomingCorrespondenceRouter.post("/update", incomingCorrespondencePostUpdate);

module.exports = {
  incomingCorrespondenceRouter
}