const { Document } = require("../models/document.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function documentGet(request, response) {
  Document.findAll({ 
    raw : true,
    where: {
      is_deleted: false
    }
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function documentPostDelete(request, response) {
  var id = request.params["id"];

  Document.update({ 
    is_deleted: true
  }, {
    where: {
      id: id
    }
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function documentPostCreate(request, response) {
  const document = request.body;
  const route = document.route;
  const routeStages = route.routeStages;

  const sequelize = Document.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Create ${document}`)

    const createdDocument = await Document.create({
      name: document.name,
      description: document.description,
      body: document.body
    }, { 
      transaction: transaction 
    });

    const createdRoute = await Route.create({
      name: route.name,
      documentId: createdDocument.id
    }, { 
      transaction: transaction 
    });

    for (const routeStage of routeStages) {
      const createdRouteStage = await RouteStage.create({
        name: routeStage.name,
        step: routeStage.step,
        all_or_one: routeStage.all_or_one,
        duration: routeStage.duration,
        start_date: routeStage.start_date,
        routeId: createdRoute.id
      }, { 
        transaction: transaction 
      });

      for (const routeStageUser of routeStage.routeStageUsers) {
        await RouteStageUser.create({
          userId: routeStageUser.userId,
          routeStageId: createdRouteStage.id
        }, { 
        transaction: transaction 
        });
      }
    }

    await transaction.commit();

    response.json(createdDocument);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

async function documentPostUpdate(request, response) {
  var document = request.body;
  console.log(`Update ${document}`)
  Document.update({ 
    name: document.name,
    description: document.description,
    body: document.body
  }, {
    where: {
      id: document.id
    }
  })
  .then((res) =>  {
    response.json(res);
  });
}

module.exports = { 
  documentGet, 
  documentPostCreate, 
  documentPostDelete, 
  documentPostUpdate 
}