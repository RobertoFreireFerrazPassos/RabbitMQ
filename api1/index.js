const express = require("express");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const amqp = require("amqplib");
var channel, connection;
const queueUser = "userQueue";

connectQueue(); // call connectQueue function

async function connectQueue() {
    try {
        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();

        await channel.assertQueue(queueUser);
        
    } catch (error) {
        console.log(error);
    }
}

const sendData = async (data) => {
    await channel.sendToQueue(queueUser, Buffer.from(JSON.stringify(data)));

    await channel.close();
    await connection.close();
}

app.post("/send-msg", (req, res) => {
    const { name } = req.body;

    const data = {
        timeStamp : new Date,
        identifier : "newuser",
        data : {
          name: name
        }
    }

    sendData(data);

    res.send("Message Sent");
    
})


app.listen(PORT, () => console.log("Server running at port " + PORT));