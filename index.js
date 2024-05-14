const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d7bt1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const roomCollection = client.db('RoyellaDB').collection('rooms');
        const bookingCollection = client.db('RoyellaDB').collection('bookings');
        const reviewCollection = client.db('RoyellaDB').collection('reviews');

        app.get('/rooms', async (req, res) => {
            const result = await roomCollection.find().toArray();
            res.send(result);
        });

        app.get('/roomsPriceByRange', async (req, res) => {
            const { minPrice, maxPrice } = req.query;
            const result = await roomCollection.find({
                price_per_night: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) }
            }).toArray();
            res.send(result);
        });

        app.get('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const room = { _id: new ObjectId(id) }
            const result = await roomCollection.findOne(room);
            res.send(result);
        })

        app.patch('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const bookedRoom = req.body;
            console.log(id, bookedRoom);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedBooked = {
                $set: {
                    availability: bookedRoom.availability
                }
            }
            const result = await roomCollection.updateOne(filter, updatedBooked, options);
            res.send(result);
        })


        app.post('/bookingRoom', async (req, res) => {
            const room = req.body;
            const result = await bookingCollection.insertOne(room);
            res.send(result);
        })

        app.get('/bookingRoom', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/bookingRoom/:id', async (req, res) => {
            const id = req.params.id;
            const bookRoom = { _id: new ObjectId(id) };
            const result = await bookingCollection.findOne(bookRoom);
            res.send(result);
        })

        app.put('/bookingRoom/:id', async (req, res) => {
            const id = req.params.id;
            const room = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedRoom = {
                $set: {
                    date: room.date
                }
            }
            const result = await bookingCollection.updateOne(filter, updatedRoom, options);
            res.send(result);
        })

        app.delete('/bookingRoom/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().sort({ timestamp: -1 }).toArray();
            res.send(result);
        })


        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Royella server is running!')
})

app.listen(port, () => {
    console.log(`Royella server is running on port ${port}`)
})