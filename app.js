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

var tournamentRoutes = require('./src/controllers/TournamentController'); // Replace with the correct path
app.use('/tournament', tournamentRoutes);


connectDB();
// ==============================================
app.use(bodyParser.json());

app.use(cors());
usersRouter(app);
swaggerDoc(app);
// ==============================================
// START THE SERVER
// ==============================================
app.listen(port);
console.log("Magic happens on port " + port);
