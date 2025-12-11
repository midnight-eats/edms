const { DeliveryMethod } = require("../models/deliveryMethod.js")

async function deliveryMethodGet(request, response) {
  await DeliveryMethod.findAll({ 
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

async function deliveryMethodPostDelete(request, response) {
  const id = request.params["id"];

  await DeliveryMethod.update({ 
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

async function deliveryMethodPostCreate(request, response) {
  const deliveryMethod = request.body;
  console.log(`Create ${deliveryMethod}`);
  await DeliveryMethod.create({
      name: deliveryMethod.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function deliveryMethodPostUpdate(request, response) {
  const deliveryMethod = request.body;
  console.log(`Update ${deliveryMethod}`);
  await DeliveryMethod.update({ 
      name: deliveryMethod.name
    }, {
      where: {
        id: deliveryMethod.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  deliveryMethodGet, 
  deliveryMethodPostCreate, 
  deliveryMethodPostDelete, 
  deliveryMethodPostUpdate 
}