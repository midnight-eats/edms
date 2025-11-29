const Sequelize = require('sequelize');

module.exports.getConnection = function getConnection()
{
    const sequelize = new Sequelize('db', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres'
    });

    return sequelize;
}