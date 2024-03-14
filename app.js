// BASE SETUP
// ==============================================
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var cors = require("cors");

var port = process.env.PORT || 3001;
const connectDB = require("./src/dbConfig/mongoose");
var bodyParser = require("body-parser");
const usersRouter = require("./src/routes/usersRoutes/users.router");
const tournamentRouter = require("./src/routes/tournamentRoutes/tournament.router");

const swaggerDoc = require("./src/docs/swaggerDoc");
const stadiumRoutes = require("./src/routes/stadiumRoutes/stadiumRoutes");
const matchRoutes = require("./src/routes/matchRoutes/matchRoutes");
const playerRoute = require("./src/routes/playerRoutes/player");
const teamRoute = require("./src/routes/teamRoutes/teams");
const path = require("path");
const matchStatsRoutes = require("./src/routes/matchRoutes/matchStatsRoutes");
// const server = http.createServer(app);
// const io = require("socket.io")(server);

connectDB();
// ==============================================
app.use(bodyParser.json());

app.use(cors());
usersRouter(app);
tournamentRouter(app);

swaggerDoc(app);

io.on("connection", (socket) => {
  console.log("a user connected");
});

// ==============================================
// START THE SERVER
// ==============================================
app.listen(port);
console.log("Magic happens on port " + port);
app.use("/stadiums", stadiumRoutes);
// app.use("/match", matchRoutes);

app.use("/matches", matchRoutes);
app.use("/player", playerRoute);
app.use("/team", teamRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route pour servir les logos
app.get("/logo/:filename", (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, "uploads", filename));
});
//matchmaking(app);
// app.use("/match", matchRoutes);
app.use("/match-stats", matchStatsRoutes);
// app.use("/matchStat", matchStatsRoutes()); // Pass the io instance to matchStatsRoutes

module.exports = app;
