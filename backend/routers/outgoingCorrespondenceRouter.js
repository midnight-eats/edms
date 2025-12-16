const express = require("express");
const { outgoingCorrespondenceGet, 
  outgoingCorrespondencePostCreate, 
  outgoingCorrespondencePostDelete, 
  outgoingCorrespondencePostUpdate } = require('../controllers/outgoingCorrespondenceController');

const outgoingCorrespondenceRouter = express.Router();

outgoingCorrespondenceRouter.get("/", outgoingCorrespondenceGet);
outgoingCorrespondenceRouter.post("/delete", outgoingCorrespondencePostDelete);
outgoingCorrespondenceRouter.post("/create", outgoingCorrespondencePostCreate);
outgoingCorrespondenceRouter.post("/update", outgoingCorrespondencePostUpdate);

module.exports = {
  outgoingCorrespondenceRouter
}