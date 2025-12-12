const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const connection = Connection.getConnection();

const Document = connection.define("documents", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name cannot be empty'
      }
    }
  },
  description: {
    type: Sequelize.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Description cannot be empty'
      }
    }
  },
  body: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  }}, {
    timestamps: false
  }
);

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  Document
};