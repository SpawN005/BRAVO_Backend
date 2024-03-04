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
const stadiumRoutes = require("./src/routes/stadiumRoutes/stadiumRoutes");
const matchRoutes = require("./src/routes/matchRoutes/matchRoutes");
const matchStatsRoutes = require ("./src/routes/matchRoutes/matchStatsRoutes");
// const server = http.createServer(app);
// const io = require("socket.io")(server);




connectDB();
// ==============================================
app.use(bodyParser.json());

app.use(cors());
usersRouter(app);
tournamentRouter(app);

swaggerDoc(app);
app.use("/stadiums", stadiumRoutes);
// app.use("/match", matchRoutes);
app.use('/match-stats', matchStatsRoutes);
app.use("/matches", matchRoutes);
// app.use("/matchStat", matchStatsRoutes()); // Pass the io instance to matchStatsRoutes





// ==============================================
// START THE SERVER
// ==============================================
app.listen(port);
console.log("Magic happens on port " + port);
