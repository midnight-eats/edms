const { Document } = require("../models/document.js");
const { InternalDocument } = require("../models/internalDocument.js");
const { InternalDocumentType } = require("../models/internalDocumentType.js");
const { Department } = require("../models/department.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { STATUSES } = require("../constants.js");

async function activeInternalDocumentGet(request, response) {
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

    const internalDocument = await InternalDocument.findOne({ 
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
        model: InternalDocumentType,
        as: 'internalDocumentType'
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
      }, {
        model: Department,
        as: 'addresser',
        attributes: ['id', 'name']
      }, {
        model: Department,
        as: 'addressee',
        attributes: ['id', 'name']
      }]
    });

    if (internalDocument) {
      const documentWithWorkflow = internalDocument.toJSON();

      documentWithWorkflow.routeStage = {
        ...routeStage.toJSON(),
        routeStageUser: routeStageUser.toJSON()
      };

      documents.push(documentWithWorkflow);
    }
  }

  response.json(documents);
}

async function activeInternalDocumentPostAccept(request, response) {
  const internalDocument = request.body;
  console.log(`hrdoc id: ${internalDocument.id}`);

  const sequelize = InternalDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    await RouteStageUser.update({
      result: true
    }, {
      where: { id: internalDocument.routeStage.routeStageUser.id },
      transaction: transaction 
    });

    console.log(`rsu id: ${internalDocument.routeStage.routeStageUser.id}`);

    const routeStageUsers = await RouteStageUser.findAll({
      where: {
        routeStageId: internalDocument.routeStage.id,
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
    
    if (internalDocument.routeStage.all_or_one)
      accepted = res.every(item => item === true);
    else
      accepted = res.some(item => item === true);

    if (accepted) {
      const route = await Route.findOne({
        where: {
          id: internalDocument.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`r id: ${internalDocument.routeStage.routeId}`);

      const nextStep = route.curr_step + 1;

      await Route.update({
        curr_step: nextStep
      }, {
        where: { id: internalDocument.routeStage.routeId },
        transaction: transaction 
      });

      const routeStages = await RouteStage.findAll({
        where: {
          routeId: internalDocument.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`rs id: ${internalDocument.routeStage.id}`);

      if (routeStages.length < nextStep) {
        await Document.update({
          status: STATUSES[1]
        }, {
          where: { id: internalDocument.document.id },
          transaction: transaction 
        });

        console.log(`doc id: ${internalDocument.document.id}`);
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
  activeInternalDocumentGet,
  activeInternalDocumentPostAccept
}