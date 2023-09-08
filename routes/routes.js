const express = require("express");
const { WalletService, CreateItems } = require("../services/WalletService.js");
const router = express.Router();
const dotenv = require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_KEY);
dotenv.config();

router.get("/get-account", async (req, res) => {
  let result = await WalletService.getWalletData(process.env.USER);

  res.send(result);
});

router
  .route("/user")
  .post(CreateItems.add_new_user_account)
  .delete(WalletService.delete_data);

router.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "sgd",
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = router;
