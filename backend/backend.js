const express = require("express");
const app = express();

app.use(express.json());

const { positionRouter } = require("./routers/positionRouter.js");
const { categoryRouter } = require("./categoryRouter.js");
const { userRouter } = require("./routers/userRouter.js");

app.use("/api/positions/", positionRouter);
app.use("/api/categories/", categoryRouter);
app.use("/api/users/", userRouter);
   
app.use("/about", function (request, response) {
    response.send("О сайте");
});
   
app.use("/", function (request, response) {
    response.send("Главная страница");
});

app.listen(3001);