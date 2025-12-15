const { Document } = require("../models/document.js");
const { HRDocument } = require("../models/hrDocument.js");
const { Department } = require("../models/department.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function hrDocumentGet(request, response) {
  await HRDocument.findAll({ 
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
      as: 'department'
    }]
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function hrDocumentPostDelete(request, response) {
  const hrDocument = request.body;

  const route = await Route.findOne({
    where: {
      documentId: hrDocument.document.id,
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

  const sequelize = HRDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const deletedHRDocument = await HRDocument.update({ 
      is_deleted: true
    }, {
      where: {
        id: hrDocument.id
      }
    });

    const deletedDocument = await Document.update({ 
      is_deleted: true
    }, {
      where: {
        id: hrDocument.document.id
      }
    });

    await Route.update({ 
      is_deleted: true
    }, {
      where: {
        documentId: hrDocument.document.id
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

    response.json(deletedHRDocument);
  } catch (err) {
    console.log(err);
  }
}

async function hrDocumentPostCreate(request, response) {
  const hrDocument = request.body;
  const route = hrDocument.document.route;
  const routeStages = route.routeStages;

  const sequelize = HRDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Create ${hrDocument}`)
    
    const createdDocument = await Document.create({
      number: hrDocument.document.number,
      subject: hrDocument.document.subject,
      body: hrDocument.document.body,
      duration: hrDocument.document.duration,
      authorId: hrDocument.document.authorId
    }, { 
      transaction: transaction 
    });

    const createdHRDocument = await HRDocument.create({
      documentId: createdDocument.id,
      employee_name: hrDocument.employee_name,
      hrDocumentTypeId: hrDocument.hrDocumentTypeId,
      positionId: hrDocument.positionId,
      departmentId: hrDocument.department.id,
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

    response.json(createdHRDocument);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

async function hrDocumentPostUpdate(request, response) {
  const { original, updated } = request.body;

  const originalRouteStages = original.document.route.routeStages;

  const updatedHRDocument = updated;
  const updatedRoute = updated.document.route;
  const updatedRouteStages = updated.document.route.routeStages;

  const sequelize = HRDocument.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Update ${original}`);

    const updatedDocument = await Document.update({
      number: updatedHRDocument.document.number,
      subject: updatedHRDocument.document.subject,
      body: updatedHRDocument.document.body,
      duration: updatedHRDocument.document.duration,
      authorId: updatedHRDocument.document.authorId
    }, {
      where: { id: updatedHRDocument.document.id },
      transaction: transaction 
    });

    const updatedHRDocumentRes = await HRDocument.update({
      employee_name: updatedHRDocument.employee_name,
      hrDocumentTypeId: updatedHRDocument.hrDocumentTypeId,
      positionId: updatedHRDocument.positionId,
      departmentId: updatedHRDocument.department.id,
    }, {
      where: { id: updatedHRDocument.id },
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

    response.json(updatedHRDocumentRes);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

module.exports = { 
  hrDocumentGet, 
  hrDocumentPostCreate, 
  hrDocumentPostDelete, 
  hrDocumentPostUpdate 
}