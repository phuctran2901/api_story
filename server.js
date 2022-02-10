require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Route = require("./routers/AppRouter");

app.use("/api", Route);

app.listen(process.env.PORT, () => {
    console.log("App running is port :", process.env.PORT);
});
