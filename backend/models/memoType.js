const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const connection = Connection.getConnection();

const MemoType = connection.define("memo_types", {
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
        msg: 'Memo type name cannot be empty'
      }
    }
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
  }, {
    timestamps: false
});

connection.sync().then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  MemoType
};