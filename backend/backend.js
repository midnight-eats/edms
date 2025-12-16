const express = require("express");
const app = express();

app.use(express.json());

const { positionRouter } = require("./routers/positionRouter.js");
const { categoryRouter } = require("./categoryRouter.js");
const { userRouter } = require("./routers/userRouter.js");
const { departmentRouter } = require("./routers/departmentRouter.js");
const { documentRouter } = require("./routers/documentRouter.js");
const { routeRouter } = require("./routers/routeRouter.js");
const { hrDocumentTypeRouter } = require("./routers/hrDocumentTypeRouter.js");
const { hrDocumentRouter } = require("./routers/hrDocumentRouter.js");
const { memoTypeRouter } = require("./routers/memoTypeRouter.js");
const { memoRouter } = require("./routers/memoRouter.js");
const { contractTypeRouter } = require("./routers/contractTypeRouter.js");
const { contractRouter } = require("./routers/contractRouter.js");
const { administrativeDocumentTypeRouter } = require("./routers/administrativeDocumentTypeRouter.js");
const { deliveryMethodRouter } = require("./routers/deliveryMethodRouter.js");
const { counterpartyRouter } = require("./routers/counterpartyRouter.js");

app.use("/api/positions/", positionRouter);
app.use("/api/categories/", categoryRouter);
app.use("/api/users/", userRouter);
app.use("/api/departments/", departmentRouter);
app.use("/api/documents/", documentRouter);
app.use("/api/routes/", routeRouter);
app.use("/api/memo-types/", memoTypeRouter);
app.use("/api/memos/", memoRouter);
app.use("/api/hr-document-types/", hrDocumentTypeRouter);
app.use("/api/hr-documents/", hrDocumentRouter);
app.use("/api/contract-types/", contractTypeRouter);
app.use("/api/contracts/", contractRouter);
app.use("/api/administrative-document-types/", administrativeDocumentTypeRouter);
app.use("/api/delivery-methods/", deliveryMethodRouter);
app.use("/api/counterparties/", counterpartyRouter);
   
app.use("/about", function (request, response) {
    response.send("О сайте");
});
   
app.use("/", function (request, response) {
    response.send("Главная страница");
});

app.listen(3001);