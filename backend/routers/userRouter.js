const express = require("express");
const { userGet, 
  userPostCreate, 
  userPostDelete, 
  userPostUpdate } = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get("/", userGet);
userRouter.post("/delete/:id", userPostDelete);
userRouter.post("/create", userPostCreate);
userRouter.post("/update", userPostUpdate);

module.exports = {
  userRouter
}