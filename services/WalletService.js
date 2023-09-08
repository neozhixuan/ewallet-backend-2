const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("../secrets/serviceAccount.json");
const { getFirestore } = require("firebase-admin/firestore");

function generateUniqueUserID() {
  // Logic to generate a unique ID (e.g., timestamp + random characters)
  const timestamp = Date.now();
  const randomChars = Math.random().toString(36).substring(2, 10);
  return `${timestamp}_${randomChars}`;
}
// let wallets;

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(firebaseApp);
// const walletData = db.collection("wallets");

class WalletService {
  //   static async injectDB() {
  //     if (wallets) {
  //       return;
  //     }
  //     try {
  //       wallets = walletData;
  //       console.log(wallets);
  //     } catch (e) {
  //       console.error(
  //         `Unable to establish a collection handle in Firebase because of error: ${e}`
  //       );
  //     }
  //   }
  static async getWalletData(user_id) {
    try {
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
  static async top_up_wallet(user_id, acc_num, amount) {
    try {
      const walletData = await this.getWalletData(user_id);

      if (walletData !== null) {
        const date = new Date();
        const credited_wallet = user_id; // Wallet receiving funds
        const debited_wallet = acc_num; // Bank account to be deducted from
        const newBal = walletData.balance + amount;
        await db.collection("wallets").doc(user_id).update({ balance: newBal });
        const transaction_id = Math.random().toString(36).substring(2, 10);

        await this._create_transaction(
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

        return walletData;
      } else {
        console.log("Unable to top up");
        return null;
      }
    } catch (error) {
      console.error("An error occurred during top-up:", error);
      return null;
    }
  }
  static async withdraw_from_wallet(user_id, acc_num, amount) {
    try {
      const walletData = await this.getWalletData(user_id);
      if (walletData != null) {
        const date = new Date();
        const credited_wallet = acc_num; //Withdraw to bank account
        const debited_wallet = user_id; //withdraw from wallet
        const newBal = walletData.balance - amount;
        await db.collection("wallets").doc(user_id).update({ balance: newBal });
        const transaction_id = Math.random().toString(36).substring(2, 10);

        await this._create_transaction(
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

        return walletData;
      } else {
        console.log("Unable to withdraw");
        return null;
      }
    } catch (error) {
      console.error("Error has occured during withdrawal", error);
      return null;
    }
  }

  static async pay_to_user(sender_id, receiver_id, amount) {
    //user_id sends payment to acc_num
    try {
      const senderData = await this.getWalletData(sender_id);
      const receiverData = await this.getWalletData(receiver_id);
      if (senderData != null && receiverData != null) {
        //check if both accounts are in db
        const date = new Date();
        const credited_wallet = receiver_id;
        const debited_wallet = sender_id;
        const senderBal = senderData.balance - amount; //deduct from sender
        await db
          .collection("wallets")
          .doc(sender_id)
          .update({ balance: senderBal });
        const receiverBal = receiverData.balance + amount; //add to receiver
        await db
          .collection("wallets")
          .doc(receiver_id)
          .update({ balance: receiverBal });
        //create transaction
        const transaction_id = Math.random().toString(36).substring(2, 10);
        await this._create_transaction(
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
        return senderData;
      } else {
        //one or more account invalid
        console.log("Unable to make payment");
        return null;
      }
    } catch (error) {
      console.log("Error has occured during payment", error);
      return null;
    }
  }
  static async _create_transaction(
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
  static async delete_data(user_id) {
    try {
      const userRef = db.collection("users").doc(user_id);
      const userDoc = await userRef.get(); // Await the result of get()

      if (userDoc.exists) {
        // Document exists, proceed with deletion
        await userRef.delete(); // Await the delete operation
        await db.collection("wallets").doc(user_id).delete(); // Await the delete operation for wallets
        console.log("User data and wallet removed successfully");
      } else {
        console.log("User data does not exist");
      }
    } catch (error) {
      console.error("Unable to delete data:", error);
    }
  }
}

class CreateItems {
  // Function to generate a unique user ID
  static async isUsernameTaken(username) {
    try {
      const collectionRef = db.collection("users");
      const query = await collectionRef.where("username", "==", username).get(); // Execute the query
      return !query.empty; // Return true if username exists
    } catch (error) {
      console.log("Error checking username availability", error);
    }
  }

  // Function to add a new user account
  static async add_new_user_account(accountDetails) {
    try {
      // Generate a unique user_id
      const user_id = generateUniqueUserID();

      // Create a new user_account object with provided details
      const user_account = {
        user_id: user_id,
        ...accountDetails, //other account details
      };

      if (
        await CreateItem.isUsernameTaken(accountDetailsFromFrontend.username)
      ) {
        console.log("Username is already taken");
      } else {
        // Save the user_account object to the 'users' collection
        const userRef = db.collection("users").doc(user_id);
        await userRef.set(user_account);
        await this.add_new_wallet(user_id);
        console.log("User account added successfully:", user_account);
      }
      // Call the function to add a new wallet
    } catch (error) {
      console.error("Error adding user account:", error);
      throw error; // Rethrow the error
    }
  }

  static async add_new_wallet(user_id) {
    try {
      const wallet = {
        user_id: user_id,
        balance: 0,
      };
      // Save wallet object to 'wallets' collection
      const walletRef = db.collection("wallets").doc(user_id); // Assuming 'wallets' is the collection name
      await walletRef.set(wallet);

      console.log("Wallet added successfully", wallet);
    } catch (error) {
      console.error("Error adding wallet:", error);
    }
  }
}

module.exports = { WalletService, CreateItems };
