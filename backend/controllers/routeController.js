const { Route } = require("../models/route.js");
const { RouteStage } = require("../models/routeStage.js");
const { RouteStageUser } = require("../models/routeStageUser.js");
const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Department } = require("../models/department.js");

Route.hasMany(RouteStage, { foreignKey: 'routeId', as: 'routeStages' });
RouteStage.belongsTo(Route);
RouteStage.hasMany(RouteStageUser, { foreignKey: 'routeStageId', as: 'routeStageUsers' });
RouteStageUser.belongsTo(RouteStage);
RouteStageUser.belongsTo(User);

async function routeGet(request, response) {
  const id = request.params["id"];

  Route.findOne({
    where: {
      documentId: id,
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
          include: [{
              model: User,
              include: [
                Position, Department
              ]
          }]
      }]
    }]
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => {
    console.log(err);
    response.status(500).json({ error: 'Internal server error' });
  });
}

module.exports = { 
  routeGet
}