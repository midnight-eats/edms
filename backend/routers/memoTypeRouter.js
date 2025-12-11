const express = require("express");
const { memoTypeGet, 
  memoTypePostCreate, 
  memoTypePostDelete, 
  memoTypePostUpdate  } = require('../controllers/memoTypeController');

const memoTypeRouter = express.Router();

memoTypeRouter.get("/", memoTypeGet);
memoTypeRouter.post("/delete/:id", memoTypePostDelete);
memoTypeRouter.post("/create", memoTypePostCreate);
memoTypeRouter.post("/update", memoTypePostUpdate);

module.exports = {
  memoTypeRouter
}