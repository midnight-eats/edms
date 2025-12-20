require('dotenv').config();

const express = require("express");
const { userGet, 
  userGetPlain,
  userPostCreate, 
  userPostDelete, 
  userPostUpdate } = require('../controllers/userController');

const userRouter = express.Router();
const jwt = require("jsonwebtoken");

userRouter.use((req, res, next) => {
  console.log("!!!!!!!!!!!!!!!!!");
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const key = process.env.JWT_KEY;
    const decoded = jwt.verify(token, key);
    req.user = decoded; // Add user info to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

userRouter.get("/", userGet);
userRouter.get("/plain", userGetPlain);
userRouter.post("/delete/:id", userPostDelete);
userRouter.post("/create", userPostCreate);
userRouter.post("/update", userPostUpdate);

module.exports = {
  userRouter
}