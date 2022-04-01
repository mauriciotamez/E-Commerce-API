const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

// Utils
const { AppError } = require('../util/appError')
const { filterObj } = require('../util/filterObj')

const prisma = new PrismaClient()

// ===================================================================================

exports.getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        password: false,
        status: true,
        updatedAt: true,
        createdAt: true
      },
      where: { status: 'active' }
    })

    res.status(200).json({
      status: 'success',
      data: { allUsers }
    })
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect()
  }
}

// ===================================================================================

exports.createNewUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return next(
        new AppError(400, 'Need to provide a username, email and password.')
      )
    }

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await prisma.users.create({
      data: { username, email, password: hashedPassword },
      select: {
        id: true,
        username: true,
        email: true,
        updatedAt: true,
        createdAt: true
      }
    })

    res.status(201).json({
      status: 'success',
      data: { user }
    })
  } catch (error) {
    console.log(error)
  } finally {
    await prisma.$disconnect()
  }
}

// ===================================================================================

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params

    const data = filterObj(req.body, 'email', 'username')

    //   const user = await prisma.users.findFirst({
    //     where: { id, status: 'active' },
    //     select: { id: true, username: true, email: true }
    //   })

    const user = await prisma.users.updateMany({
      where: { id: Number(id), status: 'active' },
      data: { ...data }
    })

    if (!user) {
      return next(new AppError(404, 'Cannot update user, invalid ID.'))
    }

    res.status(204).json({
      status: 'success',
      data: { user }
    })
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect()
  }
}

// ===================================================================================

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.users.updateMany({
      where: { id: Number(id), status: 'active' },
      data: { status: 'deleted' }
    })

    if (!user) {
      return next(new AppError(404, 'Cannot delete user, invalid ID.'))
    }

    res.status(200).json({
      status: 'success',
      message: 'deleted'
    })
  } catch (e) {
    console.log()
  } finally {
    await prisma.$disconnect()
  }
}

// ===================================================================================

exports.getProducts = async (req, res, next) => {
  try {
    const { id } = req.currentUser

    const products = await prisma.products.findMany({
      where: { UserId: id }
    })

    res.status(200).json({
      status: 'success',
      data: { products }
    })
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect()
  }
}

// ===================================================================================

exports.getOrders = async (req, res, next) => {
  try {
    const { id } = req.currentUser

    const orders = await prisma.orders.findMany({
      where: { UserId: id },
      include: {
        Carts: {
          include: {
            ProductsInCart: true
          }
        }
      }
    })

    res.status(200).json({
      status: 'success',
      data: { orders }
    })
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect()
  }
}

// ===================================================================================

exports.getOrderByID = async (req, res, next) => {
  try {
    const { id } = req.params

    const order = await prisma.orders.findFirst({
      where: { id: Number(id) }
    })

    res.status(200).json({
      status: 'success',
      data: { order }
    })
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect()
  }
}

// ===================================================================================

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return next(new AppError(400, 'Please provide email and password.'))
    }
    // Find user given an email and a status 'active'
    const user = await prisma.users.findFirst({
      where: { email, status: 'active' }
    })

    // Compare req.body password (User password) vs hashed user password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError(400, 'Credentials invalid'))
    }

    // Create JWT
    const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    })

    res.status(200).json({
      status: 'success',
      data: { token }
    })
  } catch (e) {
    console.log(e)
  }
}
