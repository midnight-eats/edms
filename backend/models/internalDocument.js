const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const { InternalDocumentType } = require("./internalDocumentType.js");
const { Department } = require("./department.js");
const { Document } = require("./document.js");
const { User } = require("./user.js");
const connection = Connection.getConnection();

const InternalDocument = connection.define("internal_documents", {
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

InternalDocument.belongsTo(Document, { as: 'document' });
InternalDocument.belongsTo(InternalDocumentType, { as: 'internalDocumentType' });
InternalDocument.belongsTo(Department, { as: 'addressee' });
InternalDocument.belongsTo(Department, { as: 'addresser' });
InternalDocument.belongsTo(User, { as: 'forExecution' });
InternalDocument.belongsTo(User, { as: 'forFamiliarization' });
InternalDocument.belongsTo(User, { as: 'supervisor' });

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  InternalDocument
};