const express = require("express");
const { routeGet } = require('../controllers/routeController');

const routeRouter = express.Router();

routeRouter.get("/:id", routeGet);

module.exports = {
  routeRouter
}