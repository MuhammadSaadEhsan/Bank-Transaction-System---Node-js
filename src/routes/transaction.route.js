const accountModel = require("../models/account.model")
const userModel = require("../models/user.model")
const express = require('express');
const router = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")
const transactionController = require('../controllers/transaction.controller')


/**
 * - create transaction
 * - /api/transaction/ 
 * - protected route 
*/ 
router.post('/',authMiddleware.authMiddleware,transactionController.createTransaction)
router.post('/system/initial-funds',authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransactions)

module.exports = router;