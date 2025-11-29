const Connection = require("./connection.js");
const { Position } = require("./models/position.js")

const express = require("express");
const app = express();

app.use(express.json());

const positionRouter = express.Router();

positionRouter.get("/", function(request, response) {
  Position.findAll({ 
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

positionRouter.post("/delete/:id", function(request, response) {
  var id = request.params["id"];

  Position.update({ 
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

positionRouter.post("/create", function(request, response) {
  var position = request.body;
  console.log(`Create ${position}`)
  Position.create({
      name: position.name
    })
    .then(res => {
      response.json(res);
    })
    .catch(err => console.log(err));
});

positionRouter.post("/update", function(request, response) {
  var position = request.body;
  console.log(`Update ${position}`)
  Position.update({ 
      name: position.name
    }, {
      where: {
        id: position.id
      }
    })
    .then((res) =>  {
      response.json(res);
    });
});

app.use("/api/positions/", positionRouter);
app.delete("/api/positions/", positionRouter);
   
app.use("/about", function (request, response) {
    response.send("О сайте");
});
   
app.use("/", function (request, response) {
    response.send("Главная страница");
});

module.exports = {
  positionRouter
}