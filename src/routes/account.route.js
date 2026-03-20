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
router.get('/',authMiddleware.authMiddleware,accountController.getUserAccountController)
router.get('/balance/:accountId',authMiddleware.authMiddleware,accountController.getAccountBalance)

module.exports = router;