const { Document } = require("../models/document.js");
const { IncomingCorrespondence } = require("../models/incomingCorrespondence.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function incomingCorrespondenceGet(request, response) {
  await IncomingCorrespondence.findAll({ 
    where: {
      is_deleted: false
    },
    include: [{
      model: Document,
      as: 'document',
      required: false,
      include: [{
        model: User,
        as: 'author',
        required: false,
        include: [{
          model: Position,
          required: false,
        }]
      }]
    }]
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function incomingCorrespondencePostDelete(request, response) {
  const incomingCorrespondence = request.body;

  const route = await Route.findOne({
    where: {
      documentId: incomingCorrespondence.document.id,
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

  const sequelize = IncomingCorrespondence.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const deletedIncomingCorrespondence = await IncomingCorrespondence.update({ 
      is_deleted: true
    }, {
      where: {
        id: incomingCorrespondence.id
      }
    });

    const deletedDocument = await Document.update({ 
      is_deleted: true
    }, {
      where: {
        id: incomingCorrespondence.document.id
      }
    });

    await Route.update({ 
      is_deleted: true
    }, {
      where: {
        documentId: incomingCorrespondence.document.id
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

    response.json(deletedIncomingCorrespondence);
  } catch (err) {
    console.log(err);
  }
}

async function incomingCorrespondencePostCreate(request, response) {
  const incomingCorrespondence = request.body;
  const route = incomingCorrespondence.document.route;
  const routeStages = route.routeStages;

  const sequelize = IncomingCorrespondence.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Create ${incomingCorrespondence}`)
    
    const createdDocument = await Document.create({
      number: incomingCorrespondence.document.number,
      subject: incomingCorrespondence.document.subject,
      body: incomingCorrespondence.document.body,
      duration: incomingCorrespondence.document.duration,
      authorId: incomingCorrespondence.document.authorId
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

    const createdIncomingCorrespondence = await IncomingCorrespondence.create({
      documentId: createdDocument.id,
      addresserId: incomingCorrespondence.addresserId,
      addresser_name: incomingCorrespondence.addresser_name,
      deliveryMethodId: incomingCorrespondence.deliveryMethodId
    }, { 
      transaction: transaction 
    });

    await transaction.commit();

    const completeIncomingCorrespondence = await IncomingCorrespondence.findOne({
      where: { 
        id: createdIncomingCorrespondence.id,
        is_deleted: false
      },
      include: [{
        model: Document,
        as: 'document',
        required: false,
        include: [{
          model: User,
          as: 'author',
          required: false,
          include: [{
            model: Position,
            required: false,
          }]
        }]
      }]
    });

    response.json(completeIncomingCorrespondence);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

async function incomingCorrespondencePostUpdate(request, response) {
  const { original, updated } = request.body;

  const originalRouteStages = original.document.route.routeStages;

  const updatedIncomingCorrespondence = updated;
  const updatedRoute = updated.document.route;
  const updatedRouteStages = updated.document.route.routeStages;

  const sequelize = IncomingCorrespondence.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Update ${original}`);

    const updatedDocument = await Document.update({
      number: updatedIncomingCorrespondence.document.number,
      subject: updatedIncomingCorrespondence.document.subject,
      body: updatedIncomingCorrespondence.document.body,
      duration: updatedIncomingCorrespondence.document.duration,
      authorId: updatedIncomingCorrespondence.document.authorId,
    }, {
      where: { id: updatedIncomingCorrespondence.document.id },
      transaction: transaction 
    });

    const updatedIncomingCorrespondenceRes = await IncomingCorrespondence.update({
      addresserId: updatedIncomingCorrespondence.addresserId,
      addresser_name: updatedIncomingCorrespondence.addresser_name,
      deliveryMethodId: updatedIncomingCorrespondence.deliveryMethodId
    }, {
      where: { id: updatedIncomingCorrespondence.id },
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

    response.json(updatedIncomingCorrespondenceRes);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

module.exports = { 
  incomingCorrespondenceGet, 
  incomingCorrespondencePostCreate, 
  incomingCorrespondencePostDelete, 
  incomingCorrespondencePostUpdate 
}