const express = require("express");
const { memoGet, 
  memoPostCreate, 
  memoPostDelete, 
  memoPostUpdate } = require('../controllers/memoController');

const memoRouter = express.Router();

memoRouter.get("/", memoGet);
memoRouter.post("/delete", memoPostDelete);
memoRouter.post("/create", memoPostCreate);
memoRouter.post("/update", memoPostUpdate);

module.exports = {
  memoRouter
}