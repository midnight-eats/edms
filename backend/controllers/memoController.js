const { Document } = require("../models/document.js");
const { Memo } = require("../models/memo.js");
const { Department } = require("../models/department.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function memoGet(request, response) {
  await Memo.findAll({ 
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
      as: 'authorManager'
    }, {
      model: User,
      as: 'signatory'
    }]
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function memoPostDelete(request, response) {
  const memo = request.body;

  const route = await Route.findOne({
    where: {
      documentId: memo.document.id,
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

  const sequelize = Memo.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const deletedMemo = await Memo.update({ 
      is_deleted: true
    }, {
      where: {
        id: memo.id
      }
    });

    const deletedDocument = await Document.update({ 
      is_deleted: true
    }, {
      where: {
        id: memo.document.id
      }
    });

    await Route.update({ 
      is_deleted: true
    }, {
      where: {
        documentId: memo.document.id
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

    response.json(deletedMemo);
  } catch (err) {
    console.log(err);
  }
}

async function memoPostCreate(request, response) {
  const memo = request.body;
  const route = memo.document.route;
  const routeStages = route.routeStages;

  const sequelize = Memo.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Create ${memo}`)
    
    const createdDocument = await Document.create({
      number: memo.document.number,
      subject: memo.document.subject,
      body: memo.document.body,
      duration: memo.document.duration,
      authorId: memo.document.authorId
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

    const createdMemo = await Memo.create({
      documentId: createdDocument.id,
      authorManagerId: memo.authorManagerId,
      memoTypeId: memo.memoTypeId,
      signatoryId: memo.signatoryId
    }, { 
      transaction: transaction 
    });

    await transaction.commit();

    const completeMemo = await Memo.findOne({
      where: { 
        id: createdMemo.id,
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
        as: 'authorManager'
      }, {
        model: User,
        as: 'signatory'
      }]
    });

    response.json(completeMemo);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

async function memoPostUpdate(request, response) {
  const { original, updated } = request.body;

  const originalRouteStages = original.document.route.routeStages;

  const updatedMemo = updated;
  const updatedRoute = updated.document.route;
  const updatedRouteStages = updated.document.route.routeStages;

  const sequelize = Memo.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Update ${original}`);
    console.log(updatedMemo.document.authorId);

    const updatedDocument = await Document.update({
      number: updatedMemo.document.number,
      subject: updatedMemo.document.subject,
      body: updatedMemo.document.body,
      duration: updatedMemo.document.duration,
      authorId: updatedMemo.document.authorId,
    }, {
      where: { id: updatedMemo.document.id },
      transaction: transaction 
    });

    const updatedMemoRes = await Memo.update({
      authorManagerId: updatedMemo.authorManagerId,
      memoTypeId: updatedMemo.memoTypeId,
      signatoryId: updatedMemo.signatoryId,
    }, {
      where: { id: updatedMemo.id },
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

    response.json(updatedMemoRes);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

module.exports = { 
  memoGet, 
  memoPostCreate, 
  memoPostDelete, 
  memoPostUpdate 
}