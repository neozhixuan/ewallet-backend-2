const express = require("express");
const {
  getWalletData,
  top_up_wallet,
  withdraw_from_wallet,
  pay_to_user,
  add_new_user_account,
  delete_data,
  add_new_wallet,
} = require("../dao/WalletService.js");
const router = express.Router();
const dotenv = require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_KEY);
dotenv.config();
//-------------------------------------------------------------//
// All the API Routes
router.route("/wallet").post(getWalletData);

router.route("/top-up-wallet").post(top_up_wallet);

router.route("/withdraw").post(withdraw_from_wallet);

router.route("/pay").post(pay_to_user);

router.route("/user").post(add_new_user_account).delete(delete_data);

router.route("/add-wallet").post(add_new_wallet);
//-------------------------------------------------------------//

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
