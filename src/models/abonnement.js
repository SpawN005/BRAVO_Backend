const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  sessionId: { type: String, required: true }, // sessionId doit être une chaîne de caractères
  endDate: { type: Date}, // endDate est requis et doit être une date
  planId: { type: String }, // planId est requis et doit être une chaîne de caractères
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  }, // userId est requis et doit être une chaîne de caractères
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
