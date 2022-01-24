import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors"

//app config
const app = express();
const port = process.env.PORT || 9000
const connectionUrl = "mongodb+srv://sevimli-stake:sevimli123@cluster0.dqt15.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const pusher = new Pusher({
    appId: "1334589",
    key: "26f92262f19ef1cccdd7",
    secret: "7dd05dd215e08a752500",
    cluster: "ap2",
    useTLS: true
});

const db = mongoose.connection;
db.once("open", () => {
    console.log("DB Connected");
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();
    changeStream.on("change", (change) => {
        console.log(change);
        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                Name: messageDetails.Name,
                message: messageDetails.message,
                product: messageDetails.product,
                receiver: messageDetails.receiver,
            })
        } else {
            console.log("Error triggering Pusher")
        }
    })
})

//middleware
app.use(express.json());
app.use(cors());


//DB Config
mongoose.connect(connectionUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

//api routes
app.get("/", (req, res) => res.status(201).send("Hello World"));

app.post("/messages/new", (req, res) => {
    const dbMessage = req.body;
    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
})

app.get("/messages/sync", (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data);
        }
    })
});


app.delete('/messages/delete/:id', async (req, res) => {
    try {
        await Messages.findByIdAndDelete(req.params.id);
        res.json({ msg: "Deleted a Product" });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
})


app.put('/messages/update/:id', async (req, res) => {
    console.log(req.body);
    const result = await Messages.findByIdAndUpdate({ _id: req.params.id }, {
        // $set: {
        //     Name: req.body[0].Name,
        //     message: req.body[0].message,
        //     product: req.body[0].product,
        //     receiver: req.body[0].receiver,
        // }
        $set: {
            Name: req.body.Name,
            message: req.body.message,
            product: req.body.product,
            receiver: req.body.receiver,
        }
    });
    res.json(result);
});



//listen
app.listen(port, () => console.log(`Listening to port: ${port}`));