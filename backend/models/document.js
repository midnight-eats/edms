const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const { User } = require("./user.js");
const { STATUSES } = require("../constants.js");
const connection = Connection.getConnection();

const Document = connection.define("documents", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  subject: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subject cannot be empty'
      }
    }
  },
  status: {
    type: Sequelize.ENUM(STATUSES),
    allowNull: false,
    defaultValue: STATUSES[0],
    validate: {
      notEmpty: {
        msg: 'Role cannot be empty'
      }
    }
  },
  body: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Body cannot be empty'
      }
    }
  },
  duration: {
    type: Sequelize.SMALLINT,
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

Document.belongsTo(User, { as: 'author' });

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  Document
};