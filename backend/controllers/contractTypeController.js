const { ContractType } = require("../models/contractType.js")

async function contractTypeGet(request, response) {
  await ContractType.findAll({ 
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

async function contractTypePostDelete(request, response) {
  const id = request.params["id"];

  await ContractType.update({ 
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

async function contractTypePostCreate(request, response) {
  const contractType = request.body;
  console.log(`Create ${contractType}`);
  await ContractType.create({
      name: contractType.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function contractTypePostUpdate(request, response) {
  const contractType = request.body;
  console.log(`Update ${contractType}`);
  await ContractType.update({ 
      name: contractType.name
    }, {
      where: {
        id: contractType.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  contractTypeGet, 
  contractTypePostCreate, 
  contractTypePostDelete, 
  contractTypePostUpdate 
}