const { Document } = require("../models/document.js");
const { InternalDocument } = require("../models/internalDocument.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Department } = require("../models/department.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function internalDocumentGet(request, response) {
  await InternalDocument.findAll({ 
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
    }, {
      model: Department,
      as: 'addressee'
    }, {
      model: Department,
      as: 'addresser'
    }]
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function internalDocumentPostDelete(request, response) {
  const internalDocument = request.body;

  const route = await Route.findOne({
    where: {
      documentId: internalDocument.document.id,
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

  const sequelize = InternalDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const deletedInternalDocument = await InternalDocument.update({ 
      is_deleted: true
    }, {
      where: {
        id: internalDocument.id
      }
    });

    const deletedDocument = await Document.update({ 
      is_deleted: true
    }, {
      where: {
        id: internalDocument.document.id
      }
    });

    await Route.update({ 
      is_deleted: true
    }, {
      where: {
        documentId: internalDocument.document.id
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

    response.json(deletedInternalDocument);
  } catch (err) {
    console.log(err);
  }
}

async function internalDocumentPostCreate(request, response) {
  const internalDocument = request.body;
  const route = internalDocument.document.route;
  const routeStages = route.routeStages;

  const sequelize = InternalDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Create ${internalDocument}`)
    
    const createdDocument = await Document.create({
      number: internalDocument.document.number,
      subject: internalDocument.document.subject,
      body: internalDocument.document.body,
      duration: internalDocument.document.duration,
      authorId: internalDocument.document.authorId
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

    const createdInternalDocument = await InternalDocument.create({
      documentId: createdDocument.id,
      addresseeId: internalDocument.addressee.id,
      addresserId: internalDocument.addresser.id,
      forExecutionId: internalDocument.forExecutionId,
      forFamiliarizationId: internalDocument.forFamiliarizationId,
      supervisorId: internalDocument.supervisorId,
      internalDocumentTypeId: internalDocument.internalDocumentTypeId
    }, { 
      transaction: transaction 
    });

    await transaction.commit();

    const completeInternalDocument = await InternalDocument.findOne({
      where: { 
        id: createdInternalDocument.id,
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
      }, {
        model: Department,
        as: 'addressee'
      }, {
        model: Department,
        as: 'addresser'
      }]
    });

    response.json(completeInternalDocument);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

async function internalDocumentPostUpdate(request, response) {
  const { original, updated } = request.body;

  const originalRouteStages = original.document.route.routeStages;

  const updatedInternalDocument = updated;
  const updatedRoute = updated.document.route;
  const updatedRouteStages = updated.document.route.routeStages;

  const sequelize = InternalDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Update ${original}`);

    const updatedDocument = await Document.update({
      number: updatedInternalDocument.document.number,
      subject: updatedInternalDocument.document.subject,
      body: updatedInternalDocument.document.body,
      duration: updatedInternalDocument.document.duration,
      authorId: updatedInternalDocument.document.authorId,
    }, {
      where: { id: updatedInternalDocument.document.id },
      transaction: transaction 
    });

    const updatedInternalDocumentRes = await InternalDocument.update({
      addresseeId: updatedInternalDocument.addressee.id,
      addresserId: updatedInternalDocument.addresser.id,
      forExecutionId: updatedInternalDocument.forExecutionId,
      forFamiliarizationId: updatedInternalDocument.forFamiliarizationId,
      supervisorId: updatedInternalDocument.supervisorId,
      internalDocumentTypeId: updatedInternalDocument.internalDocumentTypeId
    }, {
      where: { id: updatedInternalDocument.id },
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

    response.json(updatedInternalDocumentRes);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

module.exports = { 
  internalDocumentGet, 
  internalDocumentPostCreate, 
  internalDocumentPostDelete, 
  internalDocumentPostUpdate 
}