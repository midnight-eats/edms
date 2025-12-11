const { AdministrativeDocumentType } = require("../models/administrativeDocumentType.js")

async function administrativeDocumentTypeGet(request, response) {
  await AdministrativeDocumentType.findAll({ 
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

async function administrativeDocumentTypePostDelete(request, response) {
  const id = request.params["id"];

  await AdministrativeDocumentType.update({ 
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

async function administrativeDocumentTypePostCreate(request, response) {
  const administrativeDocumentType = request.body;
  console.log(`Create ${administrativeDocumentType}`);
  await AdministrativeDocumentType.create({
      name: administrativeDocumentType.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function administrativeDocumentTypePostUpdate(request, response) {
  const administrativeDocumentType = request.body;
  console.log(`Update ${administrativeDocumentType}`);
  await AdministrativeDocumentType.update({ 
      name: administrativeDocumentType.name
    }, {
      where: {
        id: administrativeDocumentType.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  administrativeDocumentTypeGet, 
  administrativeDocumentTypePostCreate, 
  administrativeDocumentTypePostDelete, 
  administrativeDocumentTypePostUpdate 
}