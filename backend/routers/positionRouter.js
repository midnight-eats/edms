require('dotenv').config();

const express = require("express");
const { positionGet, 
  positionPostCreate, 
  positionPostDelete, 
  positionPostUpdate } = require('../controllers/positionController');

const positionRouter = express.Router();
const jwt = require("jsonwebtoken");

positionRouter.use((req, res, next) => {
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

positionRouter.get("/", positionGet);
positionRouter.post("/delete/:id", positionPostDelete);
positionRouter.post("/create", positionPostCreate);
positionRouter.post("/update", positionPostUpdate);

module.exports = {
  positionRouter
}