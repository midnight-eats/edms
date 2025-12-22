const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const { Document } = require("./document.js");
const { User } = require("./user.js");
const { Counterparty } = require("./counterparty.js");
const { DeliveryMethod } = require("./deliveryMethod.js");
const connection = Connection.getConnection();

const OutgoingCorrespondence = connection.define("outgoing_correspondeces", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  addressee_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Addressee name cannot be empty'
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

OutgoingCorrespondence.belongsTo(Document, { as: 'document' });
OutgoingCorrespondence.belongsTo(Counterparty, { as: 'addressee' });
OutgoingCorrespondence.belongsTo(DeliveryMethod, { as: 'deliveryMethod' });
OutgoingCorrespondence.belongsTo(User, { as: 'preparedBy' });
OutgoingCorrespondence.belongsTo(User, { as: 'supervisor' });

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  OutgoingCorrespondence
};