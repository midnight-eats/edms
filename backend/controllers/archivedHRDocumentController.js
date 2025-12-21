const { Document } = require("../models/document.js");
const { HRDocument } = require("../models/hrDocument.js");
const { Department } = require("../models/department.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { STATUSES } = require("../constants.js");
const { hr } = require("vuetify/locale");
const { HRDocumentType } = require("../models/hrDocumentType.js");

async function archivedHRDocumentGet(request, response) {
  const id = 2;

  console.log('start');

  const routeStageUsers = await RouteStageUser.findAll({
    where: {
      userId: id,
      is_deleted: false
   }});

  if (routeStageUsers.length == 0) {
    response.json([]);
    return;
  }

  let documents = [];

  for (const routeStageUser of routeStageUsers) {
    if (!routeStageUser.result)
      continue;

    const routeStage = await RouteStage.findOne({
      where: {
        id: routeStageUser.routeStageId,
        is_deleted: false,
      }
    });

    if (!routeStage)
      continue;

    const route = await Route.findOne({
      where: {
        id: routeStage.routeId,
        is_deleted: false
      }
    });

    if (!route)
      continue;
    
    console.log('r done');

    const hrDocument = await HRDocument.findOne({ 
      where: {
        documentId: route.documentId,
        is_deleted: false
      },
      include: [{
        model: Document,
        as: 'document',
        required: false,
        where: {
          status: STATUSES[1]
        },
        include: [{
          model: User,
          as: 'author',
          required: false,
          include: [{
            model: Position,
            required: false,
          }]
        }]
      }, {
        model: Department,
        as: 'department'
      }, {
        model: HRDocumentType,
        as: 'hrDocumentType'
      }, {
        model: Position,
        as: 'position',
      }]
    });

    if (hrDocument && hrDocument.document) {
      if (!documents.find(item => item.id == hrDocument.id)) {
        const documentWithWorkflow = hrDocument.toJSON();

        documentWithWorkflow.routeStage = {
          ...routeStage.toJSON(),
          routeStageUser: routeStageUser.toJSON()
        };

        documents.push(documentWithWorkflow);
      }
    }

    console.log(documents.length);
  }

  response.json(documents);
}

module.exports = { 
  archivedHRDocumentGet
}