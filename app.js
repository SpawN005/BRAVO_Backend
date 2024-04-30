const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const connectDB = require("./src/dbConfig/mongoose");
const matchStatController = require("./src/controllers/matchStat.controller");
const moment = require("moment");

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
const Subscription = require("./src/models/abonnement");
const User = require('./src/models/users'); 
const mongoose = require('mongoose');

const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51P88OSP7whfjob9cFTeFZowSAubEgI0RCcKmVBXRBR47qTc5FpCiWyEEmkYeWZMd0I4COkP0TRd73jExA0D6ugNR004UJqZkWX')
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
const [premium, pass] = 
['price_1P8MSkP7whfjob9ctsaaUvLP', 'price_1P8MQsP7whfjob9c0tjTpE2Q'];


const stripeSession = async(plan) => {
  try {
      const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
              {
                  price: plan,
                  quantity: 1
              },
          ],
          success_url: "http://localhost:3000/Stripe/success",
          cancel_url: "http://localhost:3000/cancel"
      });
      return session;
  }catch (e){
      return e;
  }
};

app.post("/api/v1/create-subscription-checkout-session", async (req, res) => {
  const { plan, userId } = req.body; // Assuming you're receiving `userId` in the request body
  let planId = null;

  if (plan === 100) {
    planId = 'price_1P8MQsP7whfjob9c0tjTpE2Q';
  } else if (plan === 1000) {
    planId = 'price_1P8MSkP7whfjob9ctsaaUvLP';
  }
  
  try {
    const session = await stripeSession(planId);
    const user = await User.findById(userId);

    if (!user) {
      console.log("Utilisateur non trouvé.");
      return res.status(404).json({ error: 'User not found' });
    }

    // Make sure user.abonnement is initialized
    if (!user.abonnement) {
      user.abonnement = {};
    }

    user.abonnement.sessionId = session.id;
    
  
    const updatedUser = await User.patchUser(userId, user);
    
    console.log("Utilisateur mis à jour avec succès :", updatedUser);

    res.json(session); 
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});


app.post("/api/v1/payment-success", async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  
  try {
    // Retrieve payment session from Stripe
    const session = await stripe.checkout.sessions.retrieve(user.abonnement.sessionId);

    if (session.payment_status === 'paid') {
      const subscriptionId = session.subscription;
      
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const planId = subscription.plan.id;
        const planType = subscription.plan.amount === 100000 ? "premium" : "pass";
        const endDate = moment.unix(subscription.current_period_end).format('YYYY-MM-DD');

        if (user) {
          // Add new values to the subscription object
          user.abonnement.planId = planId;
          user.abonnement.endDate = endDate;
          user.abonnement.status = 'active';
          user.abonnement.price = subscription.plan.amount;
          user.abonnement.startDate = Date.now();
          user.abonnement.planType = planType;

          // Update solde based on planType
          if (planType === "premium") {
            // Add 50 to solde if premium
            user.userIdentity.solde = (user.userIdentity.solde ) + 50;
          } else if (planType === "pass") {
            // Add 10 to solde if pass
            user.userIdentity.solde = (user.userIdentity.solde ) + 10;
          }
          
          // Save the changes
          const updatedUser = await User.patchUser(userId, user);
          
          return res.json({ message: "Payment successful" });
        } else {
          console.log("User not found.");
        }
      } catch (error) {
        console.error('Error retrieving subscription:', error);
      }
    } else {
      return res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({ error: 'Failed to process payment' });
  }
});



app.get('/api/v1/user-solde/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Assuming User is your mongoose model for user data
    const user = await User.findById(userId);
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract the solde from the user object
    const solde = user.userIdentity.solde;
    console.log(solde);

    // Return the solde in the response
    res.status(200).json({solde});

    
    
  } catch (error) {
    console.error('Error retrieving user solde:', error);
    res.status(500).json({ message: 'Server error' });
  }
});











// Create Socket.IO server
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
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
