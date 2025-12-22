const { Document } = require("../models/document.js");
const { Memo } = require("../models/memo.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { STATUSES } = require("../constants.js");
const { MemoType } = require("../models/memoType.js");

async function activeMemoGet(request, response) {
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

    const memo = await Memo.findOne({ 
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
        model: MemoType,
        as: 'memoType'
      }, {
        model: User,
        as: 'authorManager'
      }, {
        model: User,
        as: 'signatory'
      }]
    });

    console.log('hrdoc done');

    if (memo) {
      const documentWithWorkflow = memo.toJSON();

      documentWithWorkflow.routeStage = {
        ...routeStage.toJSON(),
        routeStageUser: routeStageUser.toJSON()
      };

      documents.push(documentWithWorkflow);
    }
  }

  response.json(documents);
}

async function activeMemoPostAccept(request, response) {
  const memo = request.body;
  console.log(`hrdoc id: ${memo.id}`);

  const sequelize = Memo.sequelize;
  const transaction = await sequelize.transaction();

  try {
    await RouteStageUser.update({
      result: true
    }, {
      where: { id: memo.routeStage.routeStageUser.id },
      transaction: transaction 
    });

    console.log(`rsu id: ${memo.routeStage.routeStageUser.id}`);

    const routeStageUsers = await RouteStageUser.findAll({
      where: {
        routeStageId: memo.routeStage.id,
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
    
    if (memo.routeStage.all_or_one)
      accepted = res.every(item => item === true);
    else
      accepted = res.some(item => item === true);

    if (accepted) {
      const route = await Route.findOne({
        where: {
          id: memo.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`r id: ${memo.routeStage.routeId}`);

      const nextStep = route.curr_step + 1;

      await Route.update({
        curr_step: nextStep
      }, {
        where: { id: memo.routeStage.routeId },
        transaction: transaction 
      });

      const routeStages = await RouteStage.findAll({
        where: {
          routeId: memo.routeStage.routeId,
          is_deleted: false
        },
        transaction: transaction
      });

      console.log(`rs id: ${memo.routeStage.id}`);

      if (routeStages.length < nextStep) {
        await Document.update({
          status: STATUSES[1]
        }, {
          where: { id: memo.document.id },
          transaction: transaction 
        });

        console.log(`doc id: ${memo.document.id}`);
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
  activeMemoGet,
  activeMemoPostAccept
}