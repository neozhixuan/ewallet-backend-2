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

const {
  createPaymentIntent,
  createPayout,
} = require("../dao/StripeService.js");
const router = express.Router();
//-------------------------------------------------------------//
// All the Wallet API Routes
router.route("/wallet").post(getWalletData);

router.route("/top-up-wallet").post(top_up_wallet);

router.route("/withdraw").post(withdraw_from_wallet);

router.route("/pay").post(pay_to_user);

router.route("/user").post(add_new_user_account).delete(delete_data);

router.route("/add-wallet").post(add_new_wallet);
//-------------------------------------------------------------//
// All the Stripe API Routes
router.route("/create-payment-intent").post(createPaymentIntent);

router.route("/withdraw").post(createPayout);
//-------------------------------------------------------------//
module.exports = router;
