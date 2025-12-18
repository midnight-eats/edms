const { InternalDocumentType } = require("../models/internalDocumentType.js")

async function internalDocumentTypeGet(request, response) {
  await InternalDocumentType.findAll({ 
    raw : true,
    where: {
      is_deleted: false
    }
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => {
    console.log(err);
    response(500);
  });
}

async function internalDocumentTypePostDelete(request, response) {
  const id = request.params["id"];
  
  await InternalDocumentType.update({ 
      is_deleted: true
    }, {
      where: {
        id: id
      }
    })
    .then((res) => {
      response.json(res);
    })
    .catch(err => {
      console.log(err);
      response(500);
    });
}

async function internalDocumentTypePostCreate(request, response) {
  const internalDocumentType = request.body;
  console.log(`Create ${internalDocumentType}`);
  await InternalDocumentType.create({
      name: internalDocumentType.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => {
      console.log(err);
      response(500);
    });
}

async function internalDocumentTypePostUpdate(request, response) {
  const internalDocumentType = request.body;
  console.log(`Update ${internalDocumentType}`);
  await InternalDocumentType.update({ 
      name: internalDocumentType.name
    }, {
      where: {
        id: internalDocumentType.id
      }
    })
    .then((res) =>  {
      response.json(res);
    })
    .catch(err => {
      console.log(err);
      response(500);
    });
}

module.exports = { 
  internalDocumentTypeGet, 
  internalDocumentTypePostCreate, 
  internalDocumentTypePostDelete, 
  internalDocumentTypePostUpdate 
}