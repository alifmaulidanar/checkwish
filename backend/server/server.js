const express = require("express");
const cors = require("cors");
const collections = require("../api/collections");
const wishes = require("../api/wishes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Collections
app.use("/", collections);
app.use("/collection", wishes);

// Start server
app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
