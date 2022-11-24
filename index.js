const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//use middleware
app.use(cors());
app.use(express.json());

//connecting mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wxeycza.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", async (req, res) => {
  res.send("Server is running");
});
async function run() {
  try {
  } finally {
  }
}
run().catch((e) => console.log(e));
app.listen(port, () => {
  console.log("server is running on port:", port);
});
