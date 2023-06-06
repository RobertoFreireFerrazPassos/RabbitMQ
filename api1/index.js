const express = require("express");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const amqp = require("amqplib");
var channel, connection;
const exchangeUser = "userExchange";

async function connectExchange(exchange) {
    try {
        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();
        await channel.assertExchange(exchange, 'fanout', {durable: false});
        
    } catch (error) {
        console.log(error);
    }
}

const sendUserData = async (data) => {
    await connectExchange(exchangeUser); 

    await channel.publish(exchangeUser, '', Buffer.from(JSON.stringify(data)));

    await channel.close();
    await connection.close();
}

const sendUserDataInBatch = async () => {
  await connectExchange(exchangeUser);

  for (let i = 0; i < 10000; i++) {
    const data = {
      timeStamp : new Date,
      identifier : "newuser",
      data : {
        name: "user" + i
      }
    }

    await channel.publish(exchangeUser, '', Buffer.from(JSON.stringify(data)));
  }
  
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

    sendUserData(data);

    res.send("Message Sent");
    
});

app.get("/batchcreateusers", (req, res) => {
  sendUserDataInBatch();
  res.send("okay");  
});

app.listen(PORT, () => console.log("Server running at port " + PORT));