const { Department } = require("../models/department.js");
const { Document } = require("../models/document.js");
const { RouteStage } = require("../models/routeStage.js");
const { Route } = require("../models/route.js");
const { RouteStageUser } = require("../models/routeStageUser.js");

async function departmentGet(request, response) {
  await Department.findAll({ 
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

async function departmentGetPlain(request, response) {
  await Department.findAll({ 
    raw: true,
    where: {
      is_deleted: false
    }
  })
  .then((res) => {
    response.json(arr);
  })
  .catch(err => console.log(err));
}

async function departmentPostDelete(request, response) {
  const item = request.body;

  await deleteDepartmentRecursive(item)
  .then(res => {
    response.json(res);
  })
  .catch(err => console.log(err));
}

async function deleteDepartmentRecursive(item) {
  if (item.children && item.children.length > 0) {
    for (const child of item.children) {
      deleteDepartmentRecursive(child);
    }
  }

  await Department.update({ 
    is_deleted: true
  }, {
    where: {
      id: item.id
    }
  })
}

async function departmentPostCreate(request, response) {
  var department = request.body;
  console.log(`Create ${department}`)
  await Department.create({
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
  await Department.update({ 
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
  departmentGetPlain,
  departmentPostCreate, 
  departmentPostDelete, 
  departmentPostUpdate
}