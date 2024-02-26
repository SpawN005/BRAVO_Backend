// BASE SETUP
// ==============================================
var express = require("express");
var app = express();
var cors = require("cors");
var port = process.env.PORT || 3001;
const connectDB = require("./src/dbConfig/mongoose");
var bodyParser = require("body-parser");
const usersRouter = require("./src/routes/usersRoutes/users.router");
const swaggerDoc = require("./src/docs/swaggerDoc");
const stadiumRoutes = require("./src/routes/stadiumRoutes/stadiumRoutes");
const matchRoutes = require("./src/routes/matchRoutes/matchRoutes");



connectDB();
// ==============================================
app.use(bodyParser.json());

app.use(cors());
usersRouter(app);
swaggerDoc(app);
app.use("/stadiums", stadiumRoutes);
// app.use("/match", matchRoutes);

app.use("/matches", matchRoutes);





// ==============================================
// START THE SERVER
// ==============================================
app.listen(port);
console.log("Magic happens on port " + port);
