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
  const document = request.body;

  const route = await Route.findOne({
      where: {
        documentId: document.id,
        is_deleted: false
      },
      include: [{
          model: RouteStage,
          as: 'routeStages',
          where: { is_deleted: false },
          required: false,
          include: [{
              model: RouteStageUser,
              as: 'routeStageUsers',
              where: { is_deleted: false },
              required: false,
          }]
      }]
    })

  const routeStages = route.routeStages;

  const sequelize = Document.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const deletedDocument = await Document.update({ 
      is_deleted: true
    }, {
      where: {
        id: document.id
      }
    });

    await Route.update({ 
      is_deleted: true
    }, {
      where: {
        documentId: document.id
      }
    });

    for (const routeStage of routeStages) {
      await RouteStage.update({ 
        is_deleted: true
      }, {
        where: {
          routeId: route.id
        }
      });

      for (const routeStageUser of routeStage.routeStageUsers) {
        await RouteStageUser.update({ 
          is_deleted: true
        }, {
          where: {
            routeStageId: routeStage.id
          }
        });        
      }
    }

    await transaction.commit();

    response.json(deletedDocument);
  } catch (err) {
    console.log(err);
  }
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
  const { original, updated } = request.body;

  const originalRouteStages = original.route.routeStages;

  const updatedDocument = updated;
  const updatedRoute = updated.route;
  const updatedRouteStages = updated.route.routeStages;

  const sequelize = Document.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Update ${original}`);

    const updatedDocumentRes = await Document.update({
      name: updatedDocument.name,
      description: updatedDocument.description,
      body: updatedDocument.body, 
    }, {
      where: { id: updatedDocument.id },
      transaction: transaction 
    });

    await Route.update({
      name: updatedRoute.name,
      documentId: updatedDocument.id
    }, { 
      where: { id: updatedRoute.id },
      transaction: transaction 
    });

    for (const updatedRouteStage of updatedRouteStages) {
      if (updatedRouteStage.id !== 0) {
        const originalRouteStage = originalRouteStages
                                  .find(item => item.id === updatedRouteStage.id);

        await RouteStage.update({
          name: updatedRouteStage.name,
          step: updatedRouteStage.step,
          all_or_one: updatedRouteStage.all_or_one,
          duration: updatedRouteStage.duration,
          start_date: updatedRouteStage.start_date,
          routeId: updatedRoute.id
        }, { 
          where: { id: updatedRouteStage.id },
          transaction: transaction 
        });

        for (const updatedRouteStageUser of updatedRouteStage.routeStageUsers) {
          if (updatedRouteStageUser.id !== 0) {
            await RouteStageUser.update({
              userId: updatedRouteStageUser.userId,
              routeStageId: updatedRouteStage.id
            }, { 
              where: { id: updatedRouteStageUser.id },
              transaction: transaction 
            });
          } else {
              await RouteStageUser.create({
                userId: updatedRouteStageUser.userId,
                routeStageId: updatedRouteStage.id
              }, { 
                transaction: transaction 
              });
          }
        }

        for (const originalRouteStageUser of originalRouteStage.routeStageUsers) {
          const found = updatedRouteStage.routeStageUsers
                                          .find(item => item.id === originalRouteStageUser.id);

          if (!found) {
            await RouteStageUser.update({
              is_deleted: true
            }, {
              where: {
                id: originalRouteStageUser.id,
            },
              transaction: transaction
            });
          }
        }
      } else {
          const createdRouteStage = await RouteStage.create({
            name: updatedRouteStage.name,
            step: updatedRouteStage.step,
            all_or_one: updatedRouteStage.all_or_one,
            duration: updatedRouteStage.duration,
            start_date: updatedRouteStage.start_date,
            routeId: updatedRoute.id
          }, { 
            transaction: transaction 
          });

          for (const updatedRouteStageUser of updatedRouteStage.routeStageUsers) {
            await RouteStageUser.create({
              userId: updatedRouteStageUser.userId,
              routeStageId: createdRouteStage.id
            }, { 
              transaction: transaction 
            });
          }
      }
    }

    for (const originalRouteStage of originalRouteStages) {
      const found = updatedRouteStages
                    .find(item => Number(item.id) === Number(originalRouteStage.id));

      if (!found) {
        await RouteStage.update({
          is_deleted: true
          }, {
          where: {
            id: originalRouteStage.id,
          },
          transaction: transaction
        });

        for (const originalRouteStageUser of originalRouteStage.routeStageUsers) {
          await RouteStageUser.update({
            is_deleted: true,
            }, {
            where: {
              id: originalRouteStageUser.id,
            },
            transaction: transaction
          });
        }
      }
    }

    await transaction.commit();

    response.json(updatedDocumentRes);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

module.exports = { 
  documentGet, 
  documentPostCreate, 
  documentPostDelete, 
  documentPostUpdate 
}