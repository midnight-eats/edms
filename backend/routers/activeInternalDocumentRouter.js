require('dotenv').config();

const express = require("express");
const { activeInternalDocumentGet,
        activeInternalDocumentPostAccept } = require('../controllers/activeInternalDocumentController');

const activeInternalDocumentRouter = express.Router();
const jwt = require("jsonwebtoken");

activeInternalDocumentRouter.use((req, res, next) => {
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

activeInternalDocumentRouter.get("/", activeInternalDocumentGet);
activeInternalDocumentRouter.post("/accept", activeInternalDocumentPostAccept);

module.exports = {
  activeInternalDocumentRouter
}