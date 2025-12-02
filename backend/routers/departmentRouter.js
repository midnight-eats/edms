const express = require("express");
const { departmentGet, 
  departmentPostCreate, 
  departmentPostDelete, 
  departmentPostUpdate } = require('../controllers/departmentController');
const { Department } = require("../models/department.js");

const departmentRouter = express.Router();

departmentRouter.get("/", departmentGet);
//departmentRouter.post("/delete/:id", departmentPostDelete);
departmentRouter.post("/create", departmentPostCreate);
//departmentRouter.post("/update", departmentPostUpdate);

module.exports = {
  departmentRouter
}