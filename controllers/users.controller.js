const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Utils
const { catchAsync } = require('../util/catchAsync');

exports.getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await prisma.users.findMany();

    res.status(200).json({
      status: 'success',
      data: { allUsers }
    });
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

exports.createNewUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await prisma.users.create({
      data: { username, email, password }
    });

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};
