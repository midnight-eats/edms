const { MemoType } = require("../models/memoType.js")

async function memoTypeGet(request, response) {
  await MemoType.findAll({ 
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

async function memoTypePostDelete(request, response) {
  const id = request.params["id"];

  await MemoType.update({ 
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

async function memoTypePostCreate(request, response) {
  const memoType = request.body;
  console.log(`Create ${memoType}`);
  await MemoType.create({
      name: memoType.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function memoTypePostUpdate(request, response) {
  const memoType = request.body;
  console.log(`Update ${memoType}`);
  await MemoType.update({ 
      name: memoType.name
    }, {
      where: {
        id: memoType.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  memoTypeGet, 
  memoTypePostCreate, 
  memoTypePostDelete, 
  memoTypePostUpdate 
}