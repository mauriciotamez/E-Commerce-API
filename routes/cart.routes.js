const express = require('express')

// Controller
const {
  addProductToCart,
  getUserCart,
  updateCartProduct,
  removeProductFromCart,
  purchaseCart
} = require('../controllers/cart.controller')

// Middleware
const { validateSession } = require('../middlewares/auth.middleware')
// const { validateResult } = require('../middlewares/validator.middleware')

const router = express.Router()

router.use(validateSession)

router.get('/', getUserCart)

router.post(
  '/add-product',

  addProductToCart
)

router.patch('/update-product', updateCartProduct)

router.post('/purchase', purchaseCart)

router.delete('/:productId', removeProductFromCart)

module.exports = { cartRouter: router }
