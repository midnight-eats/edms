const { Document } = require("../models/document.js");

async function documentGet(request, response) {
  Document.findAll({ 
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

async function documentPostDelete(request, response) {
  var id = request.params["id"];

  Document.update({ 
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

async function documentPostCreate(request, response) {
  var document = request.body;
  console.log(`Create ${document}`)
  Document.create({
      name: document.name,
      description: document.description
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function documentPostUpdate(request, response) {
  var document = request.body;
  console.log(`Update ${document}`)
  Document.update({ 
      name: document.name,
      description: document.description
    }, {
      where: {
        id: document.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  documentGet, 
  documentPostCreate, 
  documentPostDelete, 
  documentPostUpdate 
}