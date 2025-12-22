const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const { Document } = require("./document.js");
const { User } = require("./user.js");
const { Counterparty } = require("./counterparty.js");
const { DeliveryMethod } = require("./deliveryMethod.js");
const connection = Connection.getConnection();

const IncomingCorrespondence = connection.define("incoming_correspondeces", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  addresser_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Addresser name cannot be empty'
      }
    }
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }}, {
    timestamps: false
  }
);

IncomingCorrespondence.belongsTo(Document, { as: 'document' });
IncomingCorrespondence.belongsTo(Counterparty, { as: 'addresser' });
IncomingCorrespondence.belongsTo(DeliveryMethod, { as: 'deliveryMethod' });

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  IncomingCorrespondence
};