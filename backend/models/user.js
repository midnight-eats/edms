const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const connection = Connection.getConnection();
const { Position } = require("./position.js");
const { Department } = require("./department.js");
const { ROLES } = require("../constants.js");;

const User = connection.define("users", {
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
  username: {
    type: Sequelize.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Username cannot be empty'
      }
    }
  },
  password: {
    type: Sequelize.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password cannot be empty'
      }
    }
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Invalid email'
      },
      notEmpty: {
        msg: 'Email cannot be empty'
      }
    }
  },
  role: {
    type: Sequelize.ENUM(ROLES),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Role cannot be empty'
      }
    }
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

User.belongsTo(Position);
User.belongsTo(Department);

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  User
};