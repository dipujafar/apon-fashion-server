const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgebwar.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("productDB").collection("products");
    const cartCollection = client.db("cartDB").collection("cartData");

    //products get
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get a product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // product insert
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    // Product Update
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const productData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const product = {
        $set: {
          photo: productData.photo,
          rating: productData.rating,
          name: productData.name,
          brandName: productData.brandName,
          type: productData.type,
          price: productData.price,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        product,
        options
      );
      res.send(result);
    });

    // cart related operation

    //cart data get
    app.get("/cart", async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // cart data insert
    app.post("/cart", async (req, res) => {
      const cartData = req.body;
      const result = await cartCollection.insertOne(cartData);
      res.send(result);
    });

    //cart product delete
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    app;
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Apon Fashion server is running");
});

app.listen(port, () => {
  console.log(`Apon Fashion server is running on port ${port}`);
});
