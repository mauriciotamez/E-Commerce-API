const express = require('express')

const router = express.Router()
//Middlewares
const { validateSession } = require('../middlewares/auth.middleware')

// Controllers
const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/products.controller')

router.use(validateSession)
router.route('/').post(createProduct).get(getAllProducts)

router
  .route('/:id')
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct)

module.exports = { productsRouter: router }
