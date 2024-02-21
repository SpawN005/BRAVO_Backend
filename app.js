// BASE SETUP
// ==============================================
var express = require("express");
var app = express();
var cors = require("cors");
var port = process.env.PORT || 3001;
const connectDB = require("./src/dbConfig/mongoose");
var bodyParser = require("body-parser");
const usersRouter = require("./src/routes/usersRoutes/users.router");
const tournamentRouter = require('./src/routes/tournamentRoutes/tournament.router'); 

const swaggerDoc = require("./src/docs/swaggerDoc");




connectDB();
// ==============================================
app.use(bodyParser.json());

app.use(cors());
usersRouter(app);
tournamentRouter(app);

swaggerDoc(app);
// ==============================================
// START THE SERVER
// ==============================================
app.listen(port);
console.log("Magic happens on port " + port);
