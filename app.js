const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const helmet = require('helmet')

// Controllers
const { globalErrorHandler } = require('./controllers/error.controller')

// Routers
const { usersRouter } = require('./routes/users.route')
const { productsRouter } = require('./routes/products.route')
const { cartRouter } = require('./routes/cart.routes')

const app = express()

// Middlewares
app.use(morgan('dev'))
// compress all responses
app.use(compression())
// headers
app.use(helmet())

// Enable incoming JSON data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(globalErrorHandler)

// Endpoints
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/cart', cartRouter)

module.exports = { app }
