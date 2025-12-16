const { Counterparty } = require("../models/counterparty.js")

async function counterpartyGet(request, response) {
  await Counterparty.findAll({ 
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

async function counterpartyPostDelete(request, response) {
  const id = request.params["id"];

  await Counterparty.update({ 
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

async function counterpartyPostCreate(request, response) {
  const counterparty = request.body;
  console.log(`Create ${counterparty}`);
  await Counterparty.create({
      name: counterparty.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function counterpartyPostUpdate(request, response) {
  const counterparty = request.body;
  console.log(`Update ${counterparty}`);
  await Counterparty.update({ 
      name: counterparty.name
    }, {
      where: {
        id: counterparty.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  counterpartyGet, 
  counterpartyPostCreate, 
  counterpartyPostDelete, 
  counterpartyPostUpdate 
}