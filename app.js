const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const connectDB = require("./src/dbConfig/mongoose");
const matchStatController = require("./src/controllers/matchStat.controller");

const cors = require("cors");
const bodyParser = require("body-parser");
const usersRouter = require("./src/routes/usersRoutes/users.router");
const tournamentRouter = require("./src/routes/tournamentRoutes/tournament.router");
const swaggerDoc = require("./src/docs/swaggerDoc");
const stadiumRoutes = require("./src/routes/stadiumRoutes/stadiumRoutes");
const matchRoutes = require("./src/routes/matchRoutes/matchRoutes");
const playerRoute = require("./src/routes/playerRoutes/player");
const teamRoute = require("./src/routes/teamRoutes/teams");
const matchStatsRoutes = require("./src/routes/matchRoutes/matchStatsRoutes");

const port = process.env.PORT || 3001;

// Connect to the database
connectDB();

// Middleware setup
app.use(bodyParser.json());
app.use(cors());
usersRouter(app);
tournamentRouter(app);
swaggerDoc(app);
app.use("/stadiums", stadiumRoutes);
app.use("/matches", matchRoutes);
app.use("/player", playerRoute);
app.use("/team", teamRoute);
app.use("/match-stats", matchStatsRoutes);

// Create Socket.IO server
const io = socketIO(server, {
  cors: {
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("goalScored", async (data) => {
    // Call the scoreGoal function to update match stats
    const updatedStats = await matchStatController.scoreGoal(
      data.matchId,
      data.playerId1,
      data.teamId
    );

    // Emit the updated stats to all connected clients
    io.emit("updateMatchStats", updatedStats);
  });
});
// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected");

  // Écouteur d'événement pour l'attribution d'un carton jaune
  socket.on("yellowCardGiven", async (data) => {
    try {
      // Appeler la fonction addYellowCard pour mettre à jour les statistiques de match
      const updatedCard = await matchStatController.addYellowCard(
        data.matchId,
        data.playerId,
        data.teamId
      );

      // Émettre les statistiques mises à jour à tous les clients connectés
      io.emit("updateMatchCard", updatedCard);
    } catch (error) {
      console.error("Error adding yellow card:", error);
      // Gérer l'erreur si nécessaire
    }
  });
});
io.on("connection", (socket) => {
  console.log("Client connected");

  // Écouteur d'événement pour l'attribution d'un carton jaune
  socket.on("redCardGiven", async (data) => {
    try {
      // Appeler la fonction addYellowCard pour mettre à jour les statistiques de match
      const updatedCardred = await matchStatController.addRedCard(
        data.matchId,
        data.playerId,
        data.teamId
      );

      // Émettre les statistiques mises à jour à tous les clients connectés
      io.emit("updateMatchCardred", updatedCardred);
    } catch (error) {
      console.error("Error adding red card:", error);
      // Gérer l'erreur si nécessaire
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
