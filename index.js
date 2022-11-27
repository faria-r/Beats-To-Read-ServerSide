const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
//verify JWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send("Forbidden Access");
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const categoryCollection = client
      .db("beatsToRead")
      .collection("books-categories");
    const BooksCollection = client.db("beatsToRead").collection("allBooks");
    const ordersCollection = client.db("beatsToRead").collection("orders");
    const usersCollection = client.db("beatsToRead").collection("users");

    //verify admin
    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        res.status(401).send("Unauthorized Access");
      }
      next();
    };
    //api to get JWT token
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "30D",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    //api to get admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //api to get buyer
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "Buyer" });
    });
    //api to get seller
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "Seller" });
    });
    //api to get all categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });
    //api to store added products
    app.post("/books", async (req, res) => {
      const books = req.body;
      const result = await BooksCollection.insertOne(books);
      res.send(result);
    });

    //api to get category based book
    app.get("/categories/:name", async (req, res) => {
      const name = req.params.name;
      const query = {
        CategoryName: name,
      };
      const result = await BooksCollection.find(query).toArray();
      res.send(result);
    });
    //store users orders in database;
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });
    //API to get Users orders
    app.get('/orders',async(req,res)=>{
const email = req.query.email;
const query = {email};
const order = await ordersCollection.find(query).toArray();
res.send(order)
    });
  //API to get id based orders
  app.get('/order/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const result = await ordersCollection.findOne(query);
    res.send(result)
  })
    //api to store users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUserEmail = user.email;
      const query = { email: existingUserEmail };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user alredy stored" });
      } else {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      }
    });
    //API to get sellers
    app.get("/sellers", async (req, res) => {
      const query = { role: "Seller" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    //API to get buyers
    app.get("/buyers", async (req, res) => {
      const query = { role: "Buyer" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    //API to get specific sellers product on MyProduct Page
    app.get("/myproducts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await BooksCollection.find(query).toArray();
      res.send(result);
    });
    //API to delete products of a specific user
    app.delete("/myproducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = BooksCollection.deleteOne(query);
      res.send(result);
    });
    //API to delete a user(buyer/seller)
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = usersCollection.deleteOne(query);
      res.send(result);
    });
  
  } finally {
  }
}
run().catch((e) => console.log(e));
app.listen(port, () => {
  console.log("server is running on port:", port);
});
