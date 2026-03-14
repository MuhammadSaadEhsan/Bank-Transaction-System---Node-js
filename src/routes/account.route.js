const accountModel = require("../models/account.model")
const userModel = require("../models/user.model")
const express = require('express');
const router = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")
const accountController = require('../controllers/account.controller')


/**
 * - create account for user
 * - /api/accounts/ 
 * - protected route 
*/ 
router.post('/',authMiddleware.authMiddleware,accountController.createAccountController)

module.exports = router;