const Connection = require("../connection.js")
const { Sequelize } = require('sequelize');
const { HRDocumentType } = require("./hrDocumentType.js");
const { Document } = require("./document.js");
const { Position } = require("./position.js");
const { Department } = require("./department.js");
const connection = Connection.getConnection();

const HRDocument = connection.define("hr_documents", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  employee_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Employee name cannot be empty'
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

HRDocument.belongsTo(Document, { as: 'document' });
HRDocument.belongsTo(HRDocumentType, { as: 'hrDocumentType' });
HRDocument.belongsTo(Position);
HRDocument.belongsTo(Department, { as: 'department' });

connection.sync({force: false, alter: true}).then(result => {
  console.log(result);
})
.catch(err => console.log(err));

module.exports = {
  HRDocument
};