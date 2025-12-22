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

async function activeHRDocumentGet(request, response) {
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
          status: STATUSES[0]
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

    console.log('hrdoc done');

    if (hrDocument) {
      const documentWithWorkflow = hrDocument.toJSON();

      documentWithWorkflow.routeStage = {
        ...routeStage.toJSON(),
        routeStageUser: routeStageUser.toJSON()
      };

      documents.push(documentWithWorkflow);
    }
  }

  response.json(documents);
}

async function activeHRDocumentPostAccept(request, response) {
  const hrDocument = request.body;
  console.log(`hrdoc id: ${hrDocument.id}`);

  const sequelize = HRDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    await RouteStageUser.update({
      result: true
    }, {
      where: { id: hrDocument.routeStage.routeStageUser.id },
      transaction: transaction 
    });

    console.log(`rsu id: ${hrDocument.routeStage.routeStageUser.id}`);

    const routeStageUsers = await RouteStageUser.findAll({
      where: {
        routeStageId: hrDocument.routeStage.id,
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
    
    if (hrDocument.routeStage.all_or_one)
      accepted = res.every(item => item === true);
    else
      accepted = res.some(item => item === true);

    if (accepted) {
      const route = await Route.findOne({
        where: {
          id: hrDocument.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`r id: ${hrDocument.routeStage.routeId}`);

      const nextStep = route.curr_step + 1;

      await Route.update({
        curr_step: nextStep
      }, {
        where: { id: hrDocument.routeStage.routeId },
        transaction: transaction 
      });

      const routeStages = await RouteStage.findAll({
        where: {
          routeId: hrDocument.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`rs id: ${hrDocument.routeStage.id}`);

      if (routeStages.length < nextStep) {
        await Document.update({
          status: STATUSES[1]
        }, {
          where: { id: hrDocument.document.id },
          transaction: transaction 
        });

        console.log(`doc id: ${hrDocument.document.id}`);
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
  activeHRDocumentGet,
  activeHRDocumentPostAccept
}