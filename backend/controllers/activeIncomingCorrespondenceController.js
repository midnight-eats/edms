const { Document } = require("../models/document.js");
const { IncomingCorrespondence } = require("../models/incomingCorrespondence.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { STATUSES } = require("../constants.js");
const { Counterparty } = require("../models/counterparty.js");
const { DeliveryMethod } = require("../models/deliveryMethod.js");

async function activeIncomingCorrespondenceGet(request, response) {
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

    const incomingCorrespondence = await IncomingCorrespondence.findOne({ 
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
        model: Counterparty,
        as: 'addresser'
      }, {
        model: DeliveryMethod,
        as: 'deliveryMethod'
      }]
    });

    if (incomingCorrespondence) {
      const documentWithWorkflow = incomingCorrespondence.toJSON();

      documentWithWorkflow.routeStage = {
        ...routeStage.toJSON(),
        routeStageUser: routeStageUser.toJSON()
      };

      documents.push(documentWithWorkflow);
    }
  }

  response.json(documents);
}

async function activeIncomingCorrespondencePostAccept(request, response) {
  const incomingCorrespondence = request.body;
  console.log(`hrdoc id: ${incomingCorrespondence.id}`);

  const sequelize = IncomingCorrespondence.sequelize;
  const transaction = await sequelize.transaction();

  try {
    await RouteStageUser.update({
      result: true
    }, {
      where: { id: incomingCorrespondence.routeStage.routeStageUser.id },
      transaction: transaction 
    });

    console.log(`rsu id: ${incomingCorrespondence.routeStage.routeStageUser.id}`);

    const routeStageUsers = await RouteStageUser.findAll({
      where: {
        routeStageId: incomingCorrespondence.routeStage.id,
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
    
    if (incomingCorrespondence.routeStage.all_or_one)
      accepted = res.every(item => item === true);
    else
      accepted = res.some(item => item === true);

    if (accepted) {
      const route = await Route.findOne({
        where: {
          id: incomingCorrespondence.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`r id: ${incomingCorrespondence.routeStage.routeId}`);

      const nextStep = route.curr_step + 1;

      await Route.update({
        curr_step: nextStep
      }, {
        where: { id: incomingCorrespondence.routeStage.routeId },
        transaction: transaction 
      });

      const routeStages = await RouteStage.findAll({
        where: {
          routeId: incomingCorrespondence.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`rs id: ${incomingCorrespondence.routeStage.id}`);

      if (routeStages.length < nextStep) {
        await Document.update({
          status: STATUSES[1]
        }, {
          where: { id: incomingCorrespondence.document.id },
          transaction: transaction 
        });

        console.log(`doc id: ${incomingCorrespondence.document.id}`);
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
  activeIncomingCorrespondenceGet,
  activeIncomingCorrespondencePostAccept
}