const { Document } = require("../models/document.js");
const { AdministrativeDocument } = require("../models/administrativeDocument.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function administrativeDocumentGet(request, response) {
  await AdministrativeDocument.findAll({ 
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
      model: User,
      as: 'forExecution'
    }, {
      model: User,
      as: 'forFamiliarization'
    }, {
      model: User,
      as: 'supervisor'
    }]
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function administrativeDocumentPostDelete(request, response) {
  const administrativeDocument = request.body;

  const route = await Route.findOne({
    where: {
      documentId: administrativeDocument.document.id,
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

  const sequelize = AdministrativeDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const deletedAdministrativeDocument = await AdministrativeDocument.update({ 
      is_deleted: true
    }, {
      where: {
        id: administrativeDocument.id
      }
    });

    const deletedDocument = await Document.update({ 
      is_deleted: true
    }, {
      where: {
        id: administrativeDocument.document.id
      }
    });

    await Route.update({ 
      is_deleted: true
    }, {
      where: {
        documentId: administrativeDocument.document.id
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

    response.json(deletedAdministrativeDocument);
  } catch (err) {
    console.log(err);
  }
}

async function administrativeDocumentPostCreate(request, response) {
  const administrativeDocument = request.body;
  const route = administrativeDocument.document.route;
  const routeStages = route.routeStages;

  const sequelize = AdministrativeDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Create ${administrativeDocument}`)
    
    const createdDocument = await Document.create({
      number: administrativeDocument.document.number,
      subject: administrativeDocument.document.subject,
      body: administrativeDocument.document.body,
      duration: administrativeDocument.document.duration,
      authorId: administrativeDocument.document.authorId
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

    const createdAdministrativeDocument = await AdministrativeDocument.create({
      documentId: createdDocument.id,
      forExecutionId: administrativeDocument.forExecutionId,
      forFamiliarizationId: administrativeDocument.forFamiliarizationId,
      supervisorId: administrativeDocument.supervisorId,
      administrativeDocumentTypeId: administrativeDocument.administrativeDocumentTypeId
    }, { 
      transaction: transaction 
    });

    await transaction.commit();

    const completeAdministrativeDocument = await AdministrativeDocument.findOne({
      where: { 
        id: createdAdministrativeDocument.id,
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
      model: User,
      as: 'forExecution'
      }, {
      model: User,
      as: 'forFamiliarization'
      }, {
      model: User,
      as: 'supervisor'
      }]
    });

    response.json(completeAdministrativeDocument);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

async function administrativeDocumentPostUpdate(request, response) {
  const { original, updated } = request.body;

  const originalRouteStages = original.document.route.routeStages;

  const updatedAdministrativeDocument = updated;
  const updatedRoute = updated.document.route;
  const updatedRouteStages = updated.document.route.routeStages;

  const sequelize = AdministrativeDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Update ${original}`);

    const updatedDocument = await Document.update({
      number: updatedAdministrativeDocument.document.number,
      subject: updatedAdministrativeDocument.document.subject,
      body: updatedAdministrativeDocument.document.body,
      duration: updatedAdministrativeDocument.document.duration,
      authorId: updatedAdministrativeDocument.document.authorId,
    }, {
      where: { id: updatedAdministrativeDocument.document.id },
      transaction: transaction 
    });

    const updatedAdministrativeDocumentRes = await AdministrativeDocument.update({
      forExecutionId: updatedAdministrativeDocument.forExecutionId,
      forFamiliarizationId: updatedAdministrativeDocument.forFamiliarizationId,
      supervisorId: updatedAdministrativeDocument.supervisorId,
      administrativeDocumentTypeId: updatedAdministrativeDocument.administrativeDocumentTypeId
    }, {
      where: { id: updatedAdministrativeDocument.id },
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

    response.json(updatedAdministrativeDocumentRes);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

module.exports = { 
  administrativeDocumentGet, 
  administrativeDocumentPostCreate, 
  administrativeDocumentPostDelete, 
  administrativeDocumentPostUpdate 
}