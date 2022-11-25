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
//verify JWT
function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send("Unauthorized access");
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token,process.env.ACCESS_TOKEN,function(err, decoded){
        if (err) {
            return res.status(403).send("Forbidden Access");
          }
          req.decoded = decoded;
          next();
    })
}
async function run() {
  try {
    const categoryCollection = client.db('beatsToRead').collection('books-categories');
    const BooksCollection = client.db('beatsToRead').collection('allBooks');
    const ordersCollection = client.db('beatsToRead').collection('orders');
//api to get JWT token

app.post('/jwt',(req,res)=>{
    const user = req.body;
    const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30 days'})
    res.send({token})
})
    //api to get all categories
    app.get('/categories',async(req,res)=>{
        const query = {};
        const result = await categoryCollection.find(query).toArray();
        res.send(result)
    });

    //api to get category based book

app.get('/categories/:name',async(req,res)=>{
    const name = req.params.name;
    const query = {
        CategoryName:name
        };
    const result = await BooksCollection.find(query).toArray();
    res.send(result);
});
//store users orders in database;
app.post('/orders',async(req,res)=>{
  const order = req.body;
  const result = await ordersCollection.insertOne(order);
  res.send(result)
})
  } finally {
  }
}
run().catch((e) => console.log(e));
app.listen(port, () => {
  console.log("server is running on port:", port);
});
