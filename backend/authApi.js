require("dotenv").config();

//const Connection = require("./connection.js");
const { User } = require("./models/user.js")
//const Sequelize = require("sequelize");
//const sequelize = Connection.getConnection();

const express = require("express");
const jwt = require("jsonwebtoken")

const authRouter = express.Router();

authRouter.post("/login", async function(request, response)
{
  var data = request.body;
  
  var result = {
    response: false,
    user: null,
    token: null
  };

  result.user = await User.findOne({
    where: {
      username: data.username,
      is_deleted: false
    }
  });

  console.log(result.user + ' yay');

  if (result.user) {
    //console.log('got in yay');
    if (result.user.password === data.password) {
      result.response = true;
      const signUser = {
        id: result.user.id,
        name: result.user.name,
        username: result.user.username,
      }
      result.token = jwt.sign(signUser, process.env.JWT_KEY);
    }
  }

  response.json(result);
});

module.exports = { 
  authRouter 
};
