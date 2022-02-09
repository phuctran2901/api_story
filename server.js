const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Route = require("./routers/AppRouter");

app.use("/api", Route);

const PORT = 5000;
app.listen(PORT, () => {
    console.log("App running is port :", PORT);
});
