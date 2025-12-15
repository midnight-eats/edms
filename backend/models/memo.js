const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const { MemoType } = require("./memoType.js");
const { User } = require("./user.js");
const { Document } = require("./document.js");
const connection = Connection.getConnection();

const Memo = connection.define("memos", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  is_deleted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
  }}, {
    timestamps: false
  }
);

Memo.belongsTo(Document);
Memo.belongsTo(User, { as: 'authorManager' });
Memo.belongsTo(User, { as: 'signatory' });
Memo.belongsTo(MemoType);

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  Memo
};