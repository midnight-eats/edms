const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const { ContractType } = require("./contractType.js");
const { Document } = require("./document.js");
const { Counterparty } = require("./counterparty.js");
const connection = Connection.getConnection();

const Contract = connection.define("contracts", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },  
  sum: {
    type: Sequelize.INTEGER,
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

Contract.belongsTo(Document);
Contract.belongsTo(ContractType);
Contract.belongsTo(Counterparty);

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  Contract
};