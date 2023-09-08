const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("../secrets/serviceAccount.json");
const { getFirestore } = require("firebase-admin/firestore");
// -------------------- PRIVATE/GENERAL FUNCTIONS ------------------- //
function generateUniqueUserID() {
  // Logic to generate a unique ID (e.g., timestamp + random characters)
  const timestamp = Date.now();
  const randomChars = Math.random().toString(36).substring(2, 10);
  return `${timestamp}_${randomChars}`;
}
// Function to generate a unique user ID
async function isUsernameTaken(username) {
  try {
    const collectionRef = db.collection("users");
    const query = await collectionRef.where("username", "==", username).get(); // Execute the query
    return !query.empty; // Return true if username exists
  } catch (error) {
    console.log("Error checking username availability", error);
  }
}
// Function to generate transaction
async function _create_transaction(
  user_id,
  credited_wallet,
  debited_wallet,
  transaction_id,
  date,
  type,
  amount
) {
  try {
    const reference_id = Math.random().toString(36).substring(1, 15);
    const transaction = {
      user_id: user_id,
      credited_wallet: credited_wallet,
      debited_wallet: debited_wallet,
      transaction_id: transaction_id,
      reference_id: reference_id,
      date: date,
      type: type,
      amount: amount,
    };
    const transactionRef = db.collection("Transactions").doc(reference_id);
    await transactionRef.set(transaction);
  } catch (error) {
    console.log("Unable to generate transaction");
  }
}
// ------------------------------------------------------------------- //
const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(firebaseApp);
// ------------------------------------------------------------------- //
async function getWalletData(req, res, next) {
  try {
    const user_id = req.body.userId;
    const walletRef = db.collection("wallets").doc(user_id);
    const walletDoc = await walletRef.get();

    if (walletDoc.exists) {
      return { error: "Wallet found", wallet: walletDoc };
    } else {
      console.log("Wallet not found");
      return { error: "Wallet not found", wallet: walletDoc };
    }
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return { error: "Wallet not found" };
  }
}
async function top_up_wallet(req, res, next) {
  try {
    const user_id = req.body.userId;
    const acc_num = req.body.accNum;
    const amount = req.body.amount;

    const walletRef = db.collection("wallets").doc(user_id);
    const walletDoc = (await walletRef.get()).data();

    if (walletDoc.exists !== null) {
      const date = new Date();
      const credited_wallet = user_id; // Wallet receiving funds
      const debited_wallet = acc_num; // Bank account to be deducted from
      const newBal = walletDoc.balance + amount;
      await db.collection("wallets").doc(user_id).update({ balance: newBal });
      const transaction_id = Math.random().toString(36).substring(2, 10);

      await _create_transaction(
        user_id,
        credited_wallet,
        debited_wallet,
        transaction_id,
        date,
        "Top up",
        amount
      );

      console.log(
        `$${amount} was topped up from bank account ${debited_wallet} to ${credited_wallet} at ${date}`
      );
      console.log("The new balance is", newBal);

      res.json({ status: "success", newBal: newBal });
    } else {
      res.json({
        status: "failure",
        message: "This wallet cannot be found.",
      });
    }
  } catch (error) {
    res.json({
      status: "failure",
      message: `An error occurred: ${error}`,
    });
  }
}

async function withdraw_from_wallet(req, res, next) {
  try {
    const user_id = req.body.userId;
    const acc_num = req.body.accNum;
    const amount = req.body.amount;

    const walletRef = db.collection("wallets").doc(user_id);
    const walletDoc = (await walletRef.get()).data();

    if (walletDoc.exists !== null) {
      const date = new Date();
      const credited_wallet = acc_num; //Withdraw to bank account
      const debited_wallet = user_id; //withdraw from wallet
      const newBal = walletDoc.balance - amount;
      await db.collection("wallets").doc(user_id).update({ balance: newBal });
      const transaction_id = Math.random().toString(36).substring(2, 10);

      await _create_transaction(
        user_id,
        credited_wallet,
        debited_wallet,
        transaction_id,
        date,
        "Withdrawal",
        amount
      );

      console.log(
        `$${amount} was withdrawn from ${debited_wallet} to  bank account ${credited_wallet} at ${date}`
      );
      console.log("The new balance is", newBal);
      res.json({ status: "success", newBal: newBal });
    } else {
      res.json({
        status: "failure",
        message: "This wallet cannot be found.",
      });
    }
  } catch (error) {
    res.json({
      status: "failure",
      message: `An error occurred: ${error}`,
    });
  }
}

async function pay_to_user(req, res, next) {
  const sender_id = req.body.senderId;
  const receiver_id = req.body.receiverId;
  const amount = req.body.amount;
  //user_id sends payment to acc_num
  try {
    const senderRef = db.collection("wallets").doc(sender_id);
    const senderDoc = (await senderRef.get()).data();
    const receiverRef = db.collection("wallets").doc(receiver_id);
    const receiverDoc = (await receiverRef.get()).data();
    if (senderDoc.exists !== null && receiverDoc.exists !== null) {
      //check if both accounts are in db
      const date = new Date();
      const credited_wallet = receiver_id;
      const debited_wallet = sender_id;
      const senderBal = senderDoc.balance - amount; //deduct from sender
      await db
        .collection("wallets")
        .doc(sender_id)
        .update({ balance: senderBal });
      const receiverBal = receiverDoc.balance + amount; //add to receiver
      await db
        .collection("wallets")
        .doc(receiver_id)
        .update({ balance: receiverBal });
      //create transaction
      const transaction_id = Math.random().toString(36).substring(2, 10);
      await _create_transaction(
        sender_id,
        credited_wallet,
        debited_wallet,
        transaction_id,
        date,
        "User-to-User Payment",
        amount
      );
      console.log(
        `$${amount} was deducted from ${debited_wallet} to ${credited_wallet} at ${date}`
      );
      console.log(`The new balance is ${senderBal}`); //just display new balance of sender
      console.log(`Receiver balance: ${receiverBal}`); //can delete in future
      res.json({
        status: "success",
        senderId: sender_id,
        receiverId: receiver_id,
        senderBal: senderBal,
        receiverBal: receiverBal,
      });
    } else {
      //one or more account invalid
      res.json({
        status: "failure",
        message: "Either wallet cannot be found.",
      });
    }
  } catch (error) {
    res.json({
      status: "failure",
      message: `An error occurred: ${error}`,
    });
  }
}

async function delete_data(req, res, next) {
  try {
    const user_id = req.body.userId;

    const userRef = db.collection("users").doc(user_id);
    const userDoc = await userRef.get(); // Await the result of get()

    if (userDoc.exists) {
      // Document exists, proceed with deletion
      await userRef.delete(); // Await the delete operation
      await db.collection("wallets").doc(user_id).delete(); // Await the delete operation for wallets
      res.json({
        status: "success",
        deletedId: user_id,
      });
    } else {
      res.json({
        status: "failure",
        message: "Wallet cannot be found.",
      });
    }
  } catch (error) {
    res.json({
      status: "failure",
      message: `An error occurred: ${error}`,
    });
  }
}

// Function to add a new user account
async function add_new_user_account(req, res, next) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const first = req.body.first;
    const last = req.body.last;
    const born = req.body.born;
    const email = req.body.email;

    // Generate a unique user_id
    const user_id = generateUniqueUserID();

    // Create a new user_account object with provided details
    const user_account = {
      user_id: user_id,
      username: username,
      password: password,
      first: first,
      last: last,
      born: born,
      email: email,
    };

    if (await isUsernameTaken(username)) {
      res.json({
        status: "failure",
        message: "Username is already taken.",
      });
    } else {
      // Save the user_account object to the 'users' collection
      const userRef = db.collection("users").doc(user_id);
      await userRef.set(user_account);
      await add_new_wallet(user_id);
      res.json({
        status: "success",
        ...user_account,
      });
    }
    // Call the function to add a new wallet
  } catch (error) {
    res.json({
      status: "failure",
      message: `An error occurred: ${error}`,
    });
  }
}

async function add_new_wallet(req, res, next) {
  try {
    const user_id = req.body.userId;

    const wallet = {
      user_id: user_id,
      balance: 0,
    };
    // Save wallet object to 'wallets' collection
    const walletRef = db.collection("wallets").doc(user_id); // Assuming 'wallets' is the collection name
    await walletRef.set(wallet);

    res.json({
      status: "success",
      userId: user_id,
    });
  } catch (error) {
    res.json({
      status: "failure",
      message: `An error occurred: ${error}`,
    });
  }
}

module.exports = {
  getWalletData,
  top_up_wallet,
  withdraw_from_wallet,
  pay_to_user,
  add_new_user_account,
  delete_data,
  add_new_wallet,
};
