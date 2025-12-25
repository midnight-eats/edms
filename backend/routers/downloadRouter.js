require("dotenv").config();

const Connection = require("../connection.js");
const { User } = require("../models/user.js");
const { Department } = require("../models/department.js");
const { Document } = require("../models/document.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { Contract } = require("../models/contract.js");
const { ContractType } = require("../models/contractType.js");
const { Memo } = require("../models/memo.js");
const { MemoType } = require("../models/memoType.js");
const { AdministrativeDocument } = require("../models/administrativeDocument.js");
const { AdministrativeDocumentType } = require("../models/administrativeDocumentType.js");
const { HRDocument } = require("../models/hrDocument.js");
const { HRDocumentType } = require("../models/hrDocumentType.js");
const { InternalDocument } = require("../models/internalDocument.js");
const { InternalDocumentType } = require("../models/internalDocumentType.js");
const { IncomingCorrespondence } = require("../models/incomingCorrespondence.js");
const { OutgoingCorrespondence } = require("../models/outgoingCorrespondence.js");
const { DeliveryMethod } = require("../models/deliveryMethod.js");
const Sequelize = require("sequelize");
const sequelize = Connection.getConnection();

const express = require("express");
const moment = require("moment");
const jwt = require("jsonwebtoken")

const path = require('path');
 
const downloadRouter = express.Router();

downloadRouter.use((req, res, next) => {
  console.log("!!!!!!!!!!!!!!!!!");
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  } try {
    const key = process.env.JWT_KEY;
    const decoded = jwt.verify(token, key);
    req.user = decoded; // Add user info to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

downloadRouter.get("/json", async function(req, res) {
  var result = {};

  result.users = await User.findAll();
  result.departments = await Department.findAll();
  result.documents = await Document.findAll();
  result.positions = await Position.findAll();
  result.routes = await Route.findAll();
  result.routeStages = await RouteStage.findAll();
  result.routeStageUsers = await RouteStageUser.findAll();
  result.memos = await Memo.findAll();
  result.memoTypes = await MemoType.findAll();
  result.internalDocuments = await InternalDocument.findAll();
  result.internalDocumentTypes = await InternalDocumentType.findAll();
  result.administrativeDocuments = await AdministrativeDocument.findAll();
  result.administrativeDocumentTypes = await AdministrativeDocumentType.findAll();
  result.hrDocuments = await HRDocument.findAll();
  result.hrDocumentTypes = await HRDocumentType.findAll();
  result.contracts = await Contract.findAll();
  result.contractTypes = await ContractType.findAll();
  result.incomingCorrespondences = await IncomingCorrespondence.findAll();
  result.outgoingCorrespondences = await OutgoingCorrespondence.findAll();
  result.deliveryMethods = await DeliveryMethod.findAll();

  res.json(result);
});


downloadRouter.get("/csv", async function(req, res) {
  // Set CSV headers
  res.setHeader('Content-Type', 'text/csv');
  
  const now = new Date();
  const filename = `data-${now.toISOString().slice(0,19).replace(/:/g, '-')}.csv`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Create CSV writer
  const { stringify } = require('csv-stringify');
  const stringifier = stringify({ header: true });
  
  // Pipe CSV data directly to response
  stringifier.pipe(res);
  
  // Fetch and write each table
  const tables = [
    //{ name: 'users', data: await User.findAll() },
    { name: 'departments', data: await Department.findAll() }
    // ... add all other tables
  ];
  
  for (const table of tables) {
    if (table.data.length === 0) continue;
    
    // Write table name as separator
    stringifier.write([`=== ${table.name.toUpperCase()} ===`]);
    
    // Write data
    for (const row of table.data) {
      stringifier.write(Object.values(row));
    }
    
    // Add empty line between tables
    stringifier.write([]);
  }
  
  stringifier.end();
});

// Пример - загрузка файла из файловой системы
downloadRouter.get("/download/datadump1", function(req, res)
{
  const fileName = 'sample.pdf';
  // Use path.join to create a safe, absolute path to your file
  const filePath = path.join(__dirname, 'files', fileName); 

  res.download(filePath, (err) => { // Optional callback to handle errors
    if (err) {
      console.error('File download failed:', err);
      res.status(500).send('File download failed');
    } else {
      console.log('File sent successfully');
    }
  });
});

module.exports = {
  downloadRouter
};