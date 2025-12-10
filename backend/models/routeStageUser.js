const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const connection = Connection.getConnection();
const { RouteStage } = require("./routeStage.js");
const { User } = require("./user.js");

const RouteStageUser = connection.define("route_stage_users", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  result: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }}, {
    timestamps: false
});

RouteStageUser.belongsTo(RouteStage);
RouteStageUser.belongsTo(User);

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  RouteStageUser
};