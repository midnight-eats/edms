const { Department } = require("../models/department.js");

async function departmentGet(request, response) {
  Department.findAll({ 
    raw: true,
    where: {
      is_deleted: false
    }
  })
  .then((res) => {
    var arr = [];

    for (r of res) {
      if (r.departmentId === null)
        arr.push(r);
      else {
        var found = res.find(item => item.id === r.departmentId);

        if (!found.children)
          found.children = [r];
        else
          found.children.push(r);
      }
    }

    response.json(arr);
  })
  .catch(err => console.log(err));
}

async function departmentPostDelete(request, response) {
  var id = request.params["id"];

  Department.update({ 
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

async function departmentPostCreate(request, response) {
  var department = request.body;
  console.log(`Create ${department}`)
  Department.create({
      name: department.name,
      departmentId: department.departmentId
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
}

async function departmentPostUpdate(request, response) {
  var department = request.body;
  console.log(`Update ${department}`)
  Department.update({ 
      name: department.name,
      departmentId: department.departmentId
    }, {
      where: {
        id: department.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
}

module.exports = { 
  departmentGet, 
  departmentPostCreate, 
  departmentPostDelete, 
  departmentPostUpdate
}