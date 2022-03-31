const express = require('express');

// Controllers
const { globalErrorHandler } = require('./controllers/error.controller');

// Routers
const { usersRouter } = require('./routes/users.route');

const app = express();

// Enable incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/users', usersRouter);

// Endpoints

app.use(globalErrorHandler);

module.exports = { app };
