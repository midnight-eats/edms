const { User } = require("../models/user.js");
const { Position } = require("../models/position.js");

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
      positionId: user.positionId
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
      positionId: user.positionId
    }, {
      where: {
        id: user.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  userGet, 
  userPostCreate, 
  userPostDelete, 
  userPostUpdate 
}