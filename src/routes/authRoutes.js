const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * POST /auth/login
 * Body: { "username": "admin", "password": "admin" }
 */
router.post('/login', authController.login);

module.exports = router;
