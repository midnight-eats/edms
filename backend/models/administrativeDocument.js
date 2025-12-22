const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const { AdministrativeDocumentType } = require("./administrativeDocumentType.js");
const { Document } = require("./document.js");
const { User } = require("./user.js");
const connection = Connection.getConnection();

const AdministrativeDocument = connection.define("administrative_documents", {
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

AdministrativeDocument.belongsTo(Document, { as: 'document' });
AdministrativeDocument.belongsTo(AdministrativeDocumentType, { as: 'administrativeDocumentType' });
AdministrativeDocument.belongsTo(User, { as: 'forExecution' });
AdministrativeDocument.belongsTo(User, { as: 'forFamiliarization' });
AdministrativeDocument.belongsTo(User, { as: 'supervisor' });

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  AdministrativeDocument
};