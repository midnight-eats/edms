const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const connection = Connection.getConnection();

const RouteStage = connection.define("routes_stages", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Name cannot be empty'
      }
    }
  },
  step: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  all_or_one: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  duration: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  start_date: {
    type: Sequelize.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Start date cannot be empty'
      }
    }
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }}, {
    timestamps: false
});

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  RouteStage
};