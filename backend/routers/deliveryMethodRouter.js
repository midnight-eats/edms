require('dotenv').config();

const express = require("express");
const { deliveryMethodGet, 
  deliveryMethodPostCreate, 
  deliveryMethodPostDelete, 
  deliveryMethodPostUpdate  } = require('../controllers/deliveryMethodController');

const deliveryMethodRouter = express.Router();
const jwt = require("jsonwebtoken");

deliveryMethodRouter.use((req, res, next) => {
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

deliveryMethodRouter.get("/", deliveryMethodGet);
deliveryMethodRouter.post("/delete/:id", deliveryMethodPostDelete);
deliveryMethodRouter.post("/create", deliveryMethodPostCreate);
deliveryMethodRouter.post("/update", deliveryMethodPostUpdate);

module.exports = {
  deliveryMethodRouter
}