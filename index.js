require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

//

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mdhkz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("CarUser").collection("users");
    const carCollection = client.db("AvailableCars").collection("AllCars");
    const bookingCollection = client
      .db("BookingCars")
      .collection("BookingList");
    //
    // .....all users data functionalities.....
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //
    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedUser = {
        $set: {
          lastSignInTime: req?.body?.lastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result);
    });
    //
    //
    // ............car related all data and functionalities...........
    app.post("/allCars", async (req, res) => {
      const cars = req.body;
      const result = await carCollection.insertOne(cars);
      res.send(result);
    });
    //
    app.get("/allCars", async (req, res) => {
      const cursor = carCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //
    app.get("/allCars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carCollection.findOne(query);
      res.send(result);
    });
    //
    app.get("/myCars", async (req, res) => {
      const email = req.query.email;
      const result = await carCollection.find({ email }).toArray();
      res.send(result);
    });
    //
    app.delete("/allCars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });
    //
    app.put("/allCars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const updatedReview = req.body;
      const car = {
        $set: {
          name: updatedReview.name,
          image: updatedReview.image,
          model: updatedReview.model,
          pricePerDay: updatedReview.pricePerDay,
          availability: updatedReview.availability,
          features: updatedReview.features,
          description: updatedReview.description,
        },
      };

      const result = await carCollection.updateOne(query, car);
      res.send(result);
    });
    //
    //
    // .........Car Booking Section........
    app.post("/bookList/:id", async (req, res) => {
      const email = req.body.userEmail;

      const { id } = req.body;
      if (id && email) {
        const isExist = await bookingCollection.findOne({
          id,
          userEmail: email,
        });
        if (isExist) {
          return res.json({ message: "review already exist." });
        }
        const bookList = req.body;
        const result = await bookingCollection.insertOne(bookList);
        res.send(result);
      } else {
        return res.status(402).json("id or email not found.");
      }
    });
    //
    app.get("/bookList", async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //
    app.get("/bookLists", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      try {
        const cursor = bookingCollection.find({ userEmail: email });
        console.log(cursor);
        const result = await cursor.toArray();

        res.send(result);
      } catch (err) {
        console.error("Error fetching bookList:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    });
    //
    app.delete("/bookList/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });
    //
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

//

app.get("/", (req, res) => {
  res.send("Car rent server is running.");
});

app.listen(port, () => {
  console.log(`Car rent server is running on port:${port}`);
});
