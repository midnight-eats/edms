require('dotenv').config();

const express = require("express");
const { documentGet, 
  documentPostCreate, 
  documentPostDelete, 
  documentPostUpdate } = require('../controllers/documentController');

const documentRouter = express.Router();
const jwt = require("jsonwebtoken");

documentRouter.use((req, res, next) => {
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

documentRouter.get("/", documentGet);
documentRouter.post("/delete", documentPostDelete);
documentRouter.post("/create", documentPostCreate);
documentRouter.post("/update", documentPostUpdate);

module.exports = {
  documentRouter
}