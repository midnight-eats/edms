const { Document } = require("../models/document.js");
const { AdministrativeDocument } = require("../models/administrativeDocument.js");
const { Department } = require("../models/department.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { STATUSES } = require("../constants.js");
const { hr } = require("vuetify/locale");
const { AdministrativeDocumentType } = require("../models/administrativeDocumentType.js");

async function archivedAdministrativeDocumentGet(request, response) {
  const id = request.user.id;

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

    const administrativeDocument = await AdministrativeDocument.findOne({ 
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
          }],
          attributes: ['id', 'name']
        }]
      }, {
        model: AdministrativeDocumentType,
        as: 'administrativeDocumentType'
      }, {
        model: User,
        as: 'forExecution',
        attributes: ['id', 'name']
      }, {
        model: User,
        as: 'forFamiliarization',
        attributes: ['id', 'name']
      }, {
        model: User,
        as: 'supervisor',
        attributes: ['id', 'name']
      }]
    });

    if (administrativeDocument && administrativeDocument.document) {
      if (!documents.find(item => item.id == administrativeDocument.id)) {
        const documentWithWorkflow = administrativeDocument.toJSON();

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
  archivedAdministrativeDocumentGet
}