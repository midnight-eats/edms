const { Document } = require("../models/document.js");
const { OutgoingCorrespondence } = require("../models/outgoingCorrespondence.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function outgoingCorrespondenceGet(request, response) {
  await OutgoingCorrespondence.findAll({ 
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

async function outgoingCorrespondencePostDelete(request, response) {
  const outgoingCorrespondence = request.body;

  const route = await Route.findOne({
    where: {
      documentId: outgoingCorrespondence.document.id,
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

  const sequelize = OutgoingCorrespondence.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const deletedOutgoingCorrespondence = await OutgoingCorrespondence.update({ 
      is_deleted: true
    }, {
      where: {
        id: outgoingCorrespondence.id
      }
    });

    const deletedDocument = await Document.update({ 
      is_deleted: true
    }, {
      where: {
        id: outgoingCorrespondence.document.id
      }
    });

    await Route.update({ 
      is_deleted: true
    }, {
      where: {
        documentId: outgoingCorrespondence.document.id
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

    response.json(deletedOutgoingCorrespondence);
  } catch (err) {
    console.log(err);
  }
}

async function outgoingCorrespondencePostCreate(request, response) {
  const outgoingCorrespondence = request.body;
  const route = outgoingCorrespondence.document.route;
  const routeStages = route.routeStages;

  const sequelize = OutgoingCorrespondence.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Create ${outgoingCorrespondence}`)
    
    const createdDocument = await Document.create({
      number: outgoingCorrespondence.document.number,
      subject: outgoingCorrespondence.document.subject,
      body: outgoingCorrespondence.document.body,
      duration: outgoingCorrespondence.document.duration,
      authorId: outgoingCorrespondence.document.authorId
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

    const createdOutgoingCorrespondence = await OutgoingCorrespondence.create({
      documentId: createdDocument.id,
      addresseeId: outgoingCorrespondence.addresseeId,
      addressee_name: outgoingCorrespondence.addressee_name,
      preparedById: outgoingCorrespondence.preparedById,
      registeredById: outgoingCorrespondence.registeredById,
      supervisorId: outgoingCorrespondence.supervisorId,
      deliveryMethodId: outgoingCorrespondence.deliveryMethodId
    }, { 
      transaction: transaction 
    });

    await transaction.commit();

    const completeOutgoingCorrespondence = await OutgoingCorrespondence.findOne({
      where: { 
        id: createdOutgoingCorrespondence.id,
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

    response.json(completeOutgoingCorrespondence);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

async function outgoingCorrespondencePostUpdate(request, response) {
  const { original, updated } = request.body;

  const originalRouteStages = original.document.route.routeStages;

  const updatedOutgoingCorrespondence = updated;
  const updatedRoute = updated.document.route;
  const updatedRouteStages = updated.document.route.routeStages;

  const sequelize = OutgoingCorrespondence.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Update ${original}`);

    const updatedDocument = await Document.update({
      number: updatedOutgoingCorrespondence.document.number,
      subject: updatedOutgoingCorrespondence.document.subject,
      body: updatedOutgoingCorrespondence.document.body,
      duration: updatedOutgoingCorrespondence.document.duration,
      authorId: updatedOutgoingCorrespondence.document.authorId,
    }, {
      where: { id: updatedOutgoingCorrespondence.document.id },
      transaction: transaction 
    });

    const updatedOutgoingCorrespondenceRes = await OutgoingCorrespondence.update({
      addresseeId: updatedOutgoingCorrespondence.addresseeId,
      addressee_name: updatedOutgoingCorrespondence.addressee_name,
      preparedById: updatedOutgoingCorrespondence.preparedById,
      registeredById: updatedOutgoingCorrespondence.registeredById,
      supervisorId: updatedOutgoingCorrespondence.supervisorId,
      deliveryMethodId: updatedOutgoingCorrespondence.deliveryMethodId
    }, {
      where: { id: updatedOutgoingCorrespondence.id },
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

    response.json(updatedOutgoingCorrespondenceRes);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

module.exports = { 
  outgoingCorrespondenceGet, 
  outgoingCorrespondencePostCreate, 
  outgoingCorrespondencePostDelete, 
  outgoingCorrespondencePostUpdate 
}