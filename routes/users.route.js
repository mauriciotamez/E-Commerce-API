const express = require('express');

const router = express.Router();

// Controllers
const {
  getAllUsers,
  createNewUser
} = require('../controllers/users.controller');

router.get('/', getAllUsers);

router.post('/create', createNewUser);

module.exports = { usersRouter: router };
