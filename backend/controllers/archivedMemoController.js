const { Document } = require("../models/document.js");
const { Memo } = require("../models/memo.js");
const { Department } = require("../models/department.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { STATUSES } = require("../constants.js");
const { hr } = require("vuetify/locale");
const { MemoType } = require("../models/memoType.js");

async function archivedMemoGet(request, response) {
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
    
    //console.log('r done');

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

    if (memo && memo.document) {
      if (!documents.find(item => item.id == memo.id)) {
        const documentWithWorkflow = memo.toJSON();

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
  archivedMemoGet
}