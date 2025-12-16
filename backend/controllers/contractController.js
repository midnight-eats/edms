const { Document } = require("../models/document.js");
const { Contract } = require("../models/contract.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function contractGet(request, response) {
  await Contract.findAll({ 
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

async function contractPostDelete(request, response) {
  const contract = request.body;

  const route = await Route.findOne({
    where: {
      documentId: contract.document.id,
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

  const sequelize = Contract.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const deletedContract = await Contract.update({ 
      is_deleted: true
    }, {
      where: {
        id: contract.id
      }
    });

    const deletedDocument = await Document.update({ 
      is_deleted: true
    }, {
      where: {
        id: contract.document.id
      }
    });

    await Route.update({ 
      is_deleted: true
    }, {
      where: {
        documentId: contract.document.id
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

    response.json(deletedContract);
  } catch (err) {
    console.log(err);
  }
}

async function contractPostCreate(request, response) {
  const contract = request.body;
  const route = contract.document.route;
  const routeStages = route.routeStages;

  const sequelize = Contract.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Create ${contract}`)
    
    const createdDocument = await Document.create({
      number: contract.document.number,
      subject: contract.document.subject,
      body: contract.document.body,
      duration: contract.document.duration,
      authorId: contract.document.authorId
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

    const createdContract = await Contract.create({
      documentId: createdDocument.id,
      sum: contract.sum,
      counterpartyId: contract.counterpartyId,
      contractTypeId: contract.contractTypeId
    }, { 
      transaction: transaction 
    });

    await transaction.commit();

    const completeContract = await Contract.findOne({
      where: { 
        id: createdContract.id,
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

    response.json(completeContract);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

async function contractPostUpdate(request, response) {
  const { original, updated } = request.body;

  const originalRouteStages = original.document.route.routeStages;

  const updatedContract = updated;
  const updatedRoute = updated.document.route;
  const updatedRouteStages = updated.document.route.routeStages;

  const sequelize = Contract.sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log(`Update ${original}`);

    const updatedDocument = await Document.update({
      number: updatedContract.document.number,
      subject: updatedContract.document.subject,
      body: updatedContract.document.body,
      duration: updatedContract.document.duration,
      authorId: updatedContract.document.authorId,
    }, {
      where: { id: updatedContract.document.id },
      transaction: transaction 
    });

    const updatedContractRes = await Contract.update({
      sum: updatedContract.sum,
      counterpartyId: updatedContract.counterpartyId,
      contractTypeId: updatedContract.contractTypeId
    }, {
      where: { id: updatedContract.id },
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

    response.json(updatedContractRes);
  } catch (err) {
    await transaction.rollback();

    console.log(err);
  }
}

module.exports = { 
  contractGet, 
  contractPostCreate, 
  contractPostDelete, 
  contractPostUpdate 
}