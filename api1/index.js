const express = require("express");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const amqp = require("amqplib");
var channel, connection;
const queueUser = "userQueue";

async function connectQueue(queue) {
    try {
        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();

        await channel.assertQueue(queue);
        
    } catch (error) {
        console.log(error);
    }
}

const sendUserData = async (data, queue) => {
    await connectQueue(queue); 

    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));

    await channel.close();
    await connection.close();
}

app.post("/user", (req, res) => {
    const { name } = req.body;

    const data = {
        timeStamp : new Date,
        identifier : "newuser",
        data : {
          name: name
        }
    }

    sendUserData(data, queueUser);

    res.send("Message Sent");
    
})


app.listen(PORT, () => console.log("Server running at port " + PORT));