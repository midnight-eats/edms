require('dotenv').config();

const express = require("express");
const { archivedMemoGet } = require('../controllers/archivedMemoController');

const archivedMemoRouter = express.Router();
const jwt = require("jsonwebtoken");

archivedMemoRouter.use((req, res, next) => {
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

archivedMemoRouter.get("/", archivedMemoGet);

module.exports = {
  archivedMemoRouter
}