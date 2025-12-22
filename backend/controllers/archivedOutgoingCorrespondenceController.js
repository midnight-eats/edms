const { Document } = require("../models/document.js");
const { OutgoingCorrespondence } = require("../models/outgoingCorrespondence.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Counterparty } = require("../models/counterparty.js");
const { DeliveryMethod } = require("../models/deliveryMethod.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { STATUSES } = require("../constants.js");

async function archivedOutgoingCorrespondenceGet(request, response) {
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

    const outgoingCorrespondence = await OutgoingCorrespondence.findOne({ 
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
        model: User,
        as: 'preparedBy',
        attributes: ['id', 'name']
      }, {
        model: DeliveryMethod,
        as: 'deliveryMethod',
        attributes: ['id', 'name']
      }, {
        model: Counterparty,
        as: 'addressee',
        attributes: ['id', 'name']
      }, {
        model: User,
        as: 'supervisor',
        attributes: ['id', 'name']
      }]
    });

    if (outgoingCorrespondence && outgoingCorrespondence.document) {
      if (!documents.find(item => item.id == outgoingCorrespondence.id)) {
        const documentWithWorkflow = outgoingCorrespondence.toJSON();

        documentWithWorkflow.routeStage = {
          ...routeStage.toJSON(),
          routeStageUser: routeStageUser.toJSON()
        };

        documents.push(documentWithWorkflow);
      }
    }
  }

  response.json(documents);
}

module.exports = { 
  archivedOutgoingCorrespondenceGet
}