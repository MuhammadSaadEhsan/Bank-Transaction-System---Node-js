const mongoose = require('mongoose')
const accountModel = require("../models/account.model");
const { ledgerModel } = require("../models/ledger.model");
const { transactionModel } = require("../models/transaction.model");
const userModel = require("../models/user.model");
const { sendTransactionEmail } = require("../services/email.service");

/**
 * 1. validate body
 * 2. validate account
 * 3. validate idempotency key
 * 4. valide account status
 * 5. validate sender account balance 
 * 6. create transaction with status pending 
 * 7. create ledger for debit for senderAccount
 * 8. create ledger for credit for receiverAccount
 * 9. update status of transaction to completed
 * 10. commit mongoDB session
 * 11. send email notification
 */

const createTransaction = async (req, res) => {
    try {

        const { fromAccount, toAccount, idempotencyKey, amount } = req.body;
        const normalizedAmount = Number(amount);

        if (!fromAccount || !toAccount || !idempotencyKey || !amount) {
            return res.status(400).send({
                message: "fromAccount,toAccount,idempotencyKey,amount are required fields"
            })
        }
        if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
            return res.status(400).send({
                message: "amount must be a positive number"
            })
        }
        if (fromAccount === toAccount) {
            return res.status(400).send({
                message: "fromAccount and toAccount must be different"
            })
        }
        const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
        const toUserAccount = await accountModel.findOne({ _id: toAccount });

        if (!fromUserAccount || !toUserAccount) {
            return res.status(401).send({
                message: "fromAccount or toAccount is invalid"
            })
        }
        if (!fromUserAccount.user.equals(req.user._id || (String(fromUserAccount.user) !== String(req.user._id)))) {
            return res.status(401).send({
                message: "unauthorized access, please try again"
            })
        }
        const isExistingTransaction = await transactionModel.findOne({ idempotencyKey })
        if (isExistingTransaction) {
            if (isExistingTransaction.status === 'PENDING') {
                return res.status(200).send({
                    message: "transaction is still processing"
                })
            }
            if (isExistingTransaction.status === 'COMPLETED') {
                return res.status(200).send({
                    message: "transaction is already COMPLETED",
                    transaction: isExistingTransaction
                })
            }
            if (isExistingTransaction.status === 'FAILED') {
                return res.status(500).send({
                    message: "transaction is FAILED, please try again"
                })
            }
            if (isExistingTransaction.status === 'REVERSED') {
                return res.status(500).send({
                    message: "transaction is REVERSED, please try again"
                })
            }
        }
        if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
            return res.status(400).send({
                message: "fromAccount or toAccount is inactive"
            })
        }
        const senderBalance = await fromUserAccount.getBalance()
        if (senderBalance < normalizedAmount) {
            return res.status(400).send({
                message: `insufficient balance for this transaction, current balance is ${senderBalance} while the requested amount is ${normalizedAmount}`
            })
        }


        let updatedTransaction;
        // creating transaction
        try {

            const session = await mongoose.startSession();
            await session.withTransaction(async () => {

                const transaction = await transactionModel.create([{
                    fromAccount, toAccount, amount: normalizedAmount, idempotencyKey
                }], { session })
                const transactionDoc = transaction[0];
                const debitLedger = await ledgerModel.create([{
                    account: fromAccount,
                    type: "DEBIT",
                    amount: normalizedAmount,
                    transaction: transactionDoc._id
                }], { session })
                await (() => {
                    return new Promise((resolve) => setTimeout(resolve, 20 * 1000))
                })()
                const creditLedger = await ledgerModel.create([{
                    account: toAccount,
                    type: "CREDIT",
                    amount: normalizedAmount,
                    transaction: transactionDoc._id
                }], { session });
                updatedTransaction = await transactionModel.findByIdAndUpdate(
                    transactionDoc._id,
                    { status: 'COMPLETED' },
                    { new: true, session }
                );

            });

        } catch (e) {
            return res.status(400).send({
                message: "transaction is in progress or something went wrong please try again later"
            })
        }
        res.status(201).send({
            message: "Transaction completed successfully",
            transaction: updatedTransaction
        })

        const receiver = await userModel.findById(toUserAccount.user);

        await sendTransactionEmail(req.user.email, req.user.name, normalizedAmount, "DEBIT");
        await sendTransactionEmail(receiver.email, receiver.name, normalizedAmount, "CREDIT");
        return;
    }
    catch (e) {
        return res.status(500).send({
            message: `error occur while creating transaction ${e}`
        })
    }
}

const createInitialFundsTransactions = async (req, res) => {
    try {
        const { toAccount, amount, idempotencyKey } = req.body;
        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(401).json({
                message: "toAccount,amount,idempotencyKey is required"
            })
        }
        const toAccountUser = await userModel.findOne({ _id: toAccount })
        const systemUser = await userModel.findOne({ systemUser: true, _id: req.user._id })
        if (!toAccountUser || !systemUser) {
            if (!toAccount || !amount || !idempotencyKey) {
                return res.status(404).json({
                    message: "toAccount or system user is not found"
                })
            }
        }
        let updatedTransaction;
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
            const transaction = await transactionModel.create([{
                toAccount, fromAccount: req.user._id, amount, idempotencyKey, status: 'PENDING'
            }], { session })
            const debitLedger = await ledgerModel.create([{
                account: systemUser._id, transaction: transaction[0]._id, amount, type: "DEBIT"
            }], { session })
            const creditLedger = await ledgerModel.create([{
                account: toAccount, transaction: transaction[0]._id, amount, type: "CREDIT"
            }], { session })
            // transaction.status = 'COMPLETED';
            // Update by ID
            updatedTransaction = await transactionModel.findByIdAndUpdate(
                transaction[0]._id,
                { status: 'COMPLETED' },
                { new: true, session }
            );
        });

        return res.status(201).send({
            message: "initial fund transaction completed sucessfully",
            transaction: updatedTransaction
        })
    }
    catch (e) {
        res.status(500).send({
            message: `error occur while creating initial fund transaction ${e}`
        })
    }
}

module.exports = { createTransaction, createInitialFundsTransactions }