const express = require('express')

const router = express.Router()

// Middlewares
const {
  validateSession,
  protectAccountOwner
} = require('../middlewares/auth.middleware')
const {
  createUserValidations,
  loginUserValidations,
  validateResult
} = require('../middlewares/validator.middleware')

// Controllers
const {
  getAllUsers,
  createNewUser,
  loginUser,
  updateUser,
  deleteUser,
  getProducts,
  getOrders,
  getOrderByID
} = require('../controllers/users.controller')

router.post('/login', loginUserValidations, validateResult, loginUser)

router.post('/', createUserValidations, validateResult, createNewUser)

router.use(validateSession)

router.get('/', getAllUsers)

router.get('/me', getProducts)

router.get('/orders', getOrders)

router.get('/orders/:id', getOrderByID)

router.patch('/:id', validateResult, protectAccountOwner, updateUser)

router.delete('/:id', protectAccountOwner, deleteUser)

module.exports = { usersRouter: router }
