const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const router = require("./routes/routes.js");

// const WalletService = require("./services/WalletService.js");
// WalletService.injectDB();
dotenv.config();

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(router);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("*", (req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({ message: "Please type in a valid API link" });
  } else {
    next();
  }
});
