const { Position } = require("../models/position.js")

async function positionGet(request, response) {
  Position.findAll({ 
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

async function positionPostDelete(request, response) {
  var id = request.params["id"];

  Position.update({ 
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

async function positionPostCreate(request, response) {
  var position = request.body;
  console.log(`Create ${position}`)
  Position.create({
      name: position.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function positionPostUpdate(request, response) {
  var position = request.body;
  console.log(`Update ${position}`)
  Position.update({ 
      name: position.name
    }, {
      where: {
        id: position.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  positionGet, 
  positionPostCreate, 
  positionPostDelete, 
  positionPostUpdate 
}