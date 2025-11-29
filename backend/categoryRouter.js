const { Category } = require("./models/category.js")

const express = require("express");
const app = express();

app.use(express.json());

const categoryRouter = express.Router();

categoryRouter.get("/", function(request, response) {
  Category.findAll({ 
    raw : true,
    where: {
      is_deleted: false
    }
  })
  .then((res) => {
    response.json(res);
  })
  .catch(err => console.log(err));
});

categoryRouter.post("/delete/:id", function(request, response) {
  var id = request.params["id"];

  Category.update({ 
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
});

categoryRouter.post("/create", function(request, response) {
  var category = request.body;
  console.log(`Create ${category}`)
  Category.create({
      name: category.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
});

categoryRouter.post("/update", function(request, response) {
  var category = request.body;
  console.log(`Update ${category}`)
  Category.update({ 
      name: category.name
    }, {
      where: {
        id: category.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
});

module.exports = {
  categoryRouter
}