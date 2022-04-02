const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

//util
const { filterObj } = require('../util/filterObj')
const { AppError } = require('../util/appError')

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.products.findMany({
      where: { status: 'active' },
      include: {
        Users: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })
    res.status(200).json({
      status: 'success',
      data: { products }
    })
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect()
  }
}

exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, price, quantity } = req.body
    const { id } = req.currentUser
    const product = await prisma.products.create({
      data: { title, description, price, quantity, UserId: id },
      select: {
        id: true,
        description: true,
        price: true,
        quantity: true,
        updatedAt: true,
        createdAt: true
      }
    })

    res.status(200).json({
      status: 'success',
      data: { product }
    })
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect()
  }
}

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(404).json({
        msg: 'Cant no found product wiht the given ID'
      })
    }
    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
      include: {
        Users: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })
    res.status(200).json({
      status: 'success',
      data: { product }
    })
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect()
  }
}

exports.updateProduct = async (req, res, next) => {
  try {
    const data = filterObj(
      req.body,
      'title',
      'description',
      'price',
      'quantity'
    )
    const { id } = req.params

    const product = await prisma.products.updateMany({
      where: { id: Number(id), status: 'active' },
      data: { ...data }
    })

    if (!product) {
      return next(new AppError(404, 'Product not found with the given ID'))
    }

    res.status(204).json({
      status: 'success',
      data: { product }
    })
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect()
  }
}

exports.deleteProduct = async (req, res, next) => {
  const { id } = req.params
  try {
    const product = await prisma.products.updateMany({
      where: { id: Number(id), status: 'active' },
      data: { status: 'deleted' }
    })
    res.status(200).json({
      status: 'success',
      data: { product }
    })
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect()
  }
}
