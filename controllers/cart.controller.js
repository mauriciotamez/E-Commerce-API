const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Utils
const { filterObj } = require('../util/filterObj')
const { AppError } = require('../util/appError')

// =====================================================================================

exports.getUserCart = async (req, res, next) => {
  try {
    // Current User is passed to req when session validation is executed
    const { currentUser } = req

    const cart = await prisma.carts.findFirst({
      where: {
        UserId: currentUser.id,
        status: 'active'
      },
      // Include Products in user cart
      include: { ProductsInCart: { where: { status: 'active' } } }
    })

    if (!cart) {
      return next(new AppError(404, 'This user does not have a cart yet'))
    }

    res.status(200).json({
      status: 'success',
      data: { cart }
    })
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect()
  }
}

// =====================================================================================

exports.addProductToCart = async (req, res, next) => {
  try {
    const { currentUser } = req

    const { ProductId, quantity } = req.body

    const product = await prisma.products.findFirst({
      where: { status: 'active', id: ProductId }
    })

    if (quantity > product.quantity) {
      return next(
        new AppError(400, `This product only has ${product.quantity} items.`)
      )
    }

    const cart = await prisma.carts.findFirst({
      where: { status: 'active', UserId: currentUser.id }
    })

    if (!cart) {
      const newCart = await prisma.carts.create({
        data: { UserId: currentUser.id }
      })

      await prisma.productsInCart.create({
        data: { ProductId: ProductId, CartId: newCart.id, quantity }
      })
    } else {
      const productExists = await prisma.productsInCart.findFirst({
        where: { ProductId: ProductId, CartId: cart.id }
      })

      if (productExists && productExists.status === 'active') {
        return next(new AppError(400, 'This product is already in the cart'))
      }

      // If product is in the cart but was removed before, add it again
      if (productExists && productExists.status === 'removed') {
        await prisma.productsInCart.updateMany({
          where: { ProductId: ProductId, CartId: cart.id },
          data: { status: 'active', quantity }
        })
      }

      // Add new product to cart
      if (!productExists) {
        await prisma.productsInCart.create({
          data: { CartId: cart.id, ProductId: ProductId, quantity: quantity }
        })
      }
    }
    res.status(201).json({ status: 'success', data: { product } })
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect
  }
}

// =====================================================================================

exports.updateCartProduct = async (req, res, next) => {
  try {
    const { currentUser } = req
    const { ProductId, quantity } = req.body
    const product = await prisma.products.findFirst({
      where: { status: 'active', id: ProductId }
    })

    if (quantity > product.quantity) {
      return next(
        new AppError(400, `This product only has ${product.quantity} items`)
      )
    }
    const cart = await prisma.carts.findMany({
      where: { status: 'active', UserId: currentUser.id }
    })
    if (!cart) {
      return next(new AppError(400, 'This user does not have a cart yet'))
    }
    const productInCart = await prisma.productsInCart.findMany({
      where: { status: 'active', CartId: cart.id, ProductId }
    })
    if (!productInCart) {
      return next(
        new AppError(404, `Can't update product, is not in the cart yet`)
      )
    }
    if (quantity === 0) {
      await prisma.productsInCart.updateMany({
        where: { status: 'active', CartId: cart.id, ProductId },
        data: { quantity: 0, status: 'removed' }
      })
    }
    // Update product to new qty
    if (quantity > 0) {
      await prisma.productsInCart.updateMany({
        where: { status: 'active', CartId: cart.id, ProductId },
        data: { quantity }
      })
    }
    res.status(204).json({ status: 'success' })
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect
  }
}

// =====================================================================================

exports.removeProductFromCart = async (req, res, next) => {
  try {
    const { currentUser } = req
    const { ProductId } = req.params
    const cart = await prisma.carts.findMany({
      where: { status: 'active', UserId: currentUser.id }
    })

    if (!cart) {
      return next(new AppError(404, 'This user does not have a cart yet'))
    }
    const productInCart = await prisma.productsInCart.findMany({
      where: { status: 'active', ProductId, CartId: cart.id }
    })
    console.log(productInCart)
    if (!productInCart) {
      return next(new AppError(404, 'This product does not exist in this cart'))
    }

    await prisma.productsInCart.updateMany({
      where: { status: 'active', CartId: cart.id, ProductId },
      data: { status: 'removed', quantity: 0 }
    })
    res.status(204).json({ status: 'success' })
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect
  }
}

// =====================================================================================

exports.purchaseCart = async (req, res, next) => {
  const { currentUser } = req
  const cart = await prisma.carts.findFirst({
    //   where: { userId: currentUser.id, status: 'active' },
    where: {
      UserId: currentUser.id,
      status: 'active'
    },
    include: { ProductsInCart: { where: { status: 'active' } } }
  })
  if (!cart) {
    return next(new AppError(404, 'This user does not have a cart yet'))
  }

  let totalPrice = 0
  console.log(cart)
  // Update all products as purchased
  const cartPromises = cart.ProductsInCart.map(async (product) => {
    await prisma.productsInCart.updateMany({
      data: { status: 'purchased' }
    })

    const productDetail = await prisma.products.findFirst({
      where: { id: product.ProductId }
    })

    // // Get total price of the order
    const productPrice = productDetail.price * product.quantity

    totalPrice = totalPrice + productPrice

    // // Discount the quantity from the product
    const newQty = product.quantity - product.quantity

    return await prisma.productsInCart.updateMany({
      data: { quantity: newQty }
    })
  })

  await Promise.all(cartPromises)

  // Mark cart as purchased
  await prisma.carts.updateMany({
    where: {
      UserId: currentUser.id,
      status: 'active'
    },
    data: { status: 'purchased' }
  })

  const newOrder = await prisma.orders.create({
    data: {
      UserId: currentUser.id,
      CartId: cart.id,
      totalPrice
    }
  })

  res.status(201).json({
    status: 'success',
    data: { newOrder }
  })
  try {
  } catch (error) {
    console.log(e)
  }
}
