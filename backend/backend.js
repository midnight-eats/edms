const express = require("express");
const app = express();
app.use(express.json());

const { authRouter } = require('./authApi.js');
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
const { administrativeDocumentRouter } = require("./routers/administrativeDocumentRouter.js");
const { deliveryMethodRouter } = require("./routers/deliveryMethodRouter.js");
const { counterpartyRouter } = require("./routers/counterpartyRouter.js");
const { outgoingCorrespondenceRouter } = require("./routers/outgoingCorrespondenceRouter.js");
const { incomingCorrespondenceRouter } = require("./routers/incomingCorrespondenceRouter.js");
const { internalDocumentTypeRouter } = require("./routers/internalDocumentTypeRouter.js");
const { internalDocumentRouter } = require("./routers/internalDocumentRouter.js");
const { activeHRDocumentRouter } = require("./routers/activeHRDocumentRouter.js");
const { archivedHRDocumentRouter } = require("./routers/archivedHRDocumentRouter.js");
const { activeMemoRouter } = require("./routers/activeMemoRouter.js");
const { archivedMemoRouter } = require("./routers/archivedMemoRouter.js");
const { activeContractRouter } = require("./routers/activeContractRouter.js");
const { archivedContractRouter } = require("./routers/archivedContractRouter.js");
const { activeAdministrativeDocumentRouter } = require("./routers/activeAdministrativeDocumentRouter.js");
const { archivedAdministrativeDocumentRouter } = require("./routers/archivedAdministrativeDocumentRouter.js");
const { activeOutgoingCorrespondenceRouter } = require("./routers/activeOutgoingCorrespondenceRouter.js");
const { archivedOutgoingCorrespondenceRouter } = require("./routers/archivedOutgoingCorrespondenceRouter.js");

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
app.use("/api/administrative-documents/", administrativeDocumentRouter);
app.use("/api/delivery-methods/", deliveryMethodRouter);
app.use("/api/counterparties/", counterpartyRouter);
app.use("/api/outgoing-correspondences/", outgoingCorrespondenceRouter);
app.use("/api/incoming-correspondences/", incomingCorrespondenceRouter);
app.use("/api/internal-document-types/", internalDocumentTypeRouter);
app.use("/api/internal-documents/", internalDocumentRouter);
app.use("/api/", authRouter);
app.use("/api/active/hr-documents/", activeHRDocumentRouter);
app.use("/api/archived/hr-documents/", archivedHRDocumentRouter);
app.use("/api/active/memos/", activeMemoRouter);
app.use("/api/archived/memos/", archivedMemoRouter);
app.use("/api/active/contracts/", activeContractRouter);
app.use("/api/archived/contracts/", archivedContractRouter);
app.use("/api/active/administrative-documents/", activeAdministrativeDocumentRouter);
app.use("/api/archived/administrative-documents/", archivedAdministrativeDocumentRouter);
app.use("/api/active/outgoing-correspondences/", activeOutgoingCorrespondenceRouter);
app.use("/api/archived/outgoing-correspondences/", archivedOutgoingCorrespondenceRouter);
   
app.use("/about", function (request, response) {
    response.send("О сайте");
});
   
app.use("/", function (request, response) {
    response.send("Главная страница");
});

app.listen(3001);