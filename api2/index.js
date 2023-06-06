const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;

const amqp = require("amqplib");
var channel, connection;
const queueUser = "userQueue";
var database = {}

connectQueue() // call connectQueue function

async function connectQueue() {
    try {

        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();

        await channel.assertQueue(queueUser);
        
        channel.consume(queueUser, data => {
            var eventMessage = JSON.parse(`${data.content}`);

            console.log(eventMessage);
            
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

app.get('/', (req, res) => {
  res.send(database);
});

app.listen(PORT, () => console.log("Server running at port " + PORT));
