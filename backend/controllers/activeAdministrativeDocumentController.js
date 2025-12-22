const { Document } = require("../models/document.js");
const { AdministrativeDocument } = require("../models/administrativeDocument.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { STATUSES } = require("../constants.js");
const { AdministrativeDocumentType } = require("../models/administrativeDocumentType.js");

async function activeAdministrativeDocumentGet(request, response) {
  const id = request.user.id;

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
    if (routeStageUser.result)
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
        curr_step: routeStage.step,
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
          status: STATUSES[0]
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

    if (administrativeDocument) {
      const documentWithWorkflow = administrativeDocument.toJSON();

      documentWithWorkflow.routeStage = {
        ...routeStage.toJSON(),
        routeStageUser: routeStageUser.toJSON()
      };

      documents.push(documentWithWorkflow);
    }
  }

  response.json(documents);
}

async function activeAdministrativeDocumentPostAccept(request, response) {
  const administrativeDocument = request.body;

  const sequelize = AdministrativeDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    await RouteStageUser.update({
      result: true
    }, {
      where: { id: administrativeDocument.routeStage.routeStageUser.id },
      transaction: transaction 
    });

    console.log(`rsu id: ${administrativeDocument.routeStage.routeStageUser.id}`);

    const routeStageUsers = await RouteStageUser.findAll({
      where: {
        routeStageId: administrativeDocument.routeStage.id,
        is_deleted: false
      },
      transaction: transaction
    })

    let res = [];

    for (const routeStageUser of routeStageUsers) {
      console.log(routeStageUser.id);
      res.push(routeStageUser.result);
    }

    let accepted = false;
    
    if (administrativeDocument.routeStage.all_or_one)
      accepted = res.every(item => item === true);
    else
      accepted = res.some(item => item === true);

    if (accepted) {
      const route = await Route.findOne({
        where: {
          id: administrativeDocument.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`r id: ${administrativeDocument.routeStage.routeId}`);

      const nextStep = route.curr_step + 1;

      await Route.update({
        curr_step: nextStep
      }, {
        where: { id: administrativeDocument.routeStage.routeId },
        transaction: transaction 
      });

      const routeStages = await RouteStage.findAll({
        where: {
          routeId: administrativeDocument.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`rs id: ${administrativeDocument.routeStage.id}`);

      if (routeStages.length < nextStep) {
        await Document.update({
          status: STATUSES[1]
        }, {
          where: { id: administrativeDocument.document.id },
          transaction: transaction 
        });

        console.log(`doc id: ${administrativeDocument.document.id}`);
      }
    }

    await transaction.commit();

    response.status(200).send();
  } catch (err) {
    await transaction.rollback();

    response.status(500).send();
  }
}

module.exports = { 
  activeAdministrativeDocumentGet,
  activeAdministrativeDocumentPostAccept
}