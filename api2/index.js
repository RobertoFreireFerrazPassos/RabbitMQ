const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('API 2 is up and running!');
});

app.listen(3002, () => {
  console.log('API 2 is listening on port 3002');
});