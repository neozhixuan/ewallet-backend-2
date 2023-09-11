const dotenv = require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_KEY);
dotenv.config();

async function createPaymentIntent(req, res, next) {
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "sgd",
  });
  res.json({ status: "Success", clientSecret: paymentIntent.client_secret });
}

async function createPayout(req, res, next) {
  const amount = req.body.amount;
  const currency = req.body.currency;
  const destinationDetails = req.body.destinationDetails;
  const payout = await stripe.transfers.create({
    amount: amount * 100, // Amount in cents (Stripe expects the amount in the smallest currency unit)
    currency: currency,
    destination: destinationDetails, // The user's bank account or Stripe account ID
  });

  return payout;
}

module.exports = { createPaymentIntent, createPayout };
