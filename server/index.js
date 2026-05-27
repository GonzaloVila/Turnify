const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { PORT, CORS_ORIGIN } = require('./src/config/env');
const routes = require('./src/routes/index');
const errorHandler = require('./src/middlewares/errorHandler.middleware');

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Turnify server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
