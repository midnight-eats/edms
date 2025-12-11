const { HRDocumentType } = require("../models/hrDocumentType.js")

async function hrDocumentTypeGet(request, response) {
  await HRDocumentType.findAll({ 
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

async function hrDocumentTypePostDelete(request, response) {
  const id = request.params["id"];

  await HRDocumentType.update({ 
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

async function hrDocumentTypePostCreate(request, response) {
  const hrDocumentType = request.body;
  console.log(`Create ${hrDocumentType}`);
  await HRDocumentType.create({
      name: hrDocumentType.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function hrDocumentTypePostUpdate(request, response) {
  const hrDocumentType = request.body;
  console.log(`Update ${hrDocumentType}`);
  await HRDocumentType.update({ 
      name: hrDocumentType.name
    }, {
      where: {
        id: hrDocumentType.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  hrDocumentTypeGet, 
  hrDocumentTypePostCreate, 
  hrDocumentTypePostDelete, 
  hrDocumentTypePostUpdate 
}