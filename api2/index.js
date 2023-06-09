const express = require("express");
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

const amqp = require("amqplib");
var channel, connection;
const exchangeUser = "userExchange";
const queueUser = "userQueueApi2";
var database = {
  user : []
}

connectQueue();

async function connectQueue() {
    try {
        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();

        await channel.assertQueue(queueUser);
        channel.prefetch(2);
        await channel.bindQueue(queueUser, exchangeUser, '');
        
        channel.consume(queueUser, data => {
            var eventMessage = JSON.parse(`${data.content}`);

            if (eventMessage.identifier === "newuser") {
              if (!database["user"]) {
                database["user"] = [];
              }

              database["user"].push(eventMessage.data);
              channel.ack(data);
            }
        })

    } catch (error) {
        console.log(error);
    }
}

app.get('/users', (req, res) => {
  res.send(database["user"]);
});

app.listen(PORT, () => console.log("Server running at port " + PORT));
