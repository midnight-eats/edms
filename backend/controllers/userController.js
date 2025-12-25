const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");
const { Department } = require("../models/department.js");

async function userGet(request, response) {
  User.findAll({
    raw : true,
    where: {
      is_deleted: false
    }
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function userGetPlain(request, response) {
  User.findAll({
    include: [
      Position,
      Department
    ],
    where: {
      is_deleted: false
    }
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function userPostDelete(request, response) {
  var id = request.params["id"];

  User.update({ 
      is_deleted: true
    }, {
      where: {
        id: id
      }
    })
    .then((res) => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function userPostCreate(request, response) {
  var user = request.body;
  console.log(`Create ${user}`)
  User.create({
      name: user.name,
      username: user.username,
      password: user.password,
      email: user.email,
      role: user.role,
      positionId: user.positionId,
      departmentId: user.departmentId, 
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function userPostUpdate(request, response) {
  var user = request.body;
  console.log(`Update ${user}`)
  User.update({ 
      name: user.name,
      username: user.username,
      password: user.password,
      email: user.email,
      role: user.role,
      positionId: user.positionId,
      departmentId: user.departmentId, 
    }, {
      where: {
        id: user.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}


async function userGetById(request, response) {
  var id = request.params["id"];

  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

  User.findOne({ 
    where: {
      id: id,
      is_deleted: false
    },
    attributes: ['id', 'username', 'name', 'role']
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

module.exports = { 
  userGet,
  userGetPlain,
  userPostCreate, 
  userPostDelete, 
  userPostUpdate,
  userGetById
}