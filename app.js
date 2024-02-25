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
const playerRoute = require('./src/routes/playerRoutes/player')
const teamRoute = require('./src/routes/teamRoutes/teams')
const path = require('path');

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
app.use('/player',playerRoute)
app.use('/team',teamRoute)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour servir les logos
app.get('/logo/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, 'uploads', filename));
});