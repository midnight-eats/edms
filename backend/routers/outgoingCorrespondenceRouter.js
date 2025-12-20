require('dotenv').config();

const express = require("express");
const { outgoingCorrespondenceGet, 
  outgoingCorrespondencePostCreate, 
  outgoingCorrespondencePostDelete, 
  outgoingCorrespondencePostUpdate } = require('../controllers/outgoingCorrespondenceController');

const outgoingCorrespondenceRouter = express.Router();
const jwt = require("jsonwebtoken");

outgoingCorrespondenceRouter.use((req, res, next) => {
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

outgoingCorrespondenceRouter.get("/", outgoingCorrespondenceGet);
outgoingCorrespondenceRouter.post("/delete", outgoingCorrespondencePostDelete);
outgoingCorrespondenceRouter.post("/create", outgoingCorrespondencePostCreate);
outgoingCorrespondenceRouter.post("/update", outgoingCorrespondencePostUpdate);

module.exports = {
  outgoingCorrespondenceRouter
}