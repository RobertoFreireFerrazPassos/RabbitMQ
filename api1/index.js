const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('API 1 is up and running!');
});

app.listen(3001, () => {
  console.log('API 1 is listening on port 3001');
});