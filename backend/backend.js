const express = require("express");
const app = express();

app.use(express.json());

const { positionRouter } = require("./routers/positionRouter.js");
const { categoryRouter } = require("./categoryRouter.js");
const { userRouter } = require("./routers/userRouter.js");
const { departmentRouter } = require("./routers/departmentRouter.js");
const { documentRouter } = require("./routers/documentRouter.js");
const { hrDocumentTypeRouter } = require("./routers/hrDocumentTypeRouter.js");
const { memoTypeRouter } = require("./routers/memoTypeRouter.js");
const { contractTypeRouter } = require("./routers/contractTypeRouter.js");

app.use("/api/positions/", positionRouter);
app.use("/api/categories/", categoryRouter);
app.use("/api/users/", userRouter);
app.use("/api/departments/", departmentRouter);
app.use("/api/documents/", documentRouter);
app.use("/api/memo-types/", memoTypeRouter);
app.use("/api/hr-document-types/", hrDocumentTypeRouter);
app.use("/api/contract-types/", contractTypeRouter);
   
app.use("/about", function (request, response) {
    response.send("О сайте");
});
   
app.use("/", function (request, response) {
    response.send("Главная страница");
});

app.listen(3001);