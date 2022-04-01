const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')

// Models

// Utils
const { AppError } = require('../util/appError')
const prisma = new PrismaClient()

// ===================================================================================

exports.validateSession = async (req, res, next) => {
  try {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next(new AppError(401, 'Invalid session'))
    }

    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    )

    const user = await prisma.users.findFirst({
      where: { id: decodedToken.id, status: 'active' }
    })

    if (!user) {
      return next(new AppError(401, 'Invalid session'))
    }

    req.currentUser = user
    next()
  } catch (e) {
    console.log(e)
  } finally {
    await prisma.$disconnect()
  }
}

// ===================================================================================

exports.protectAccountOwner = async (req, res, next) => {
  const { id } = req.params
  const { currentUser } = req

  if (currentUser.id !== +id) {
    return next(new AppError(403, `You can't update other users accounts`))
  }

  next()
}
