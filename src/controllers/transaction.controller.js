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

const createTransaction =  async (req,res)=>{
    const {fromAccount,toAccount,idempotencyKey,amount} = req.body;

    if(!fromAccount || !toAccount || !idempotencyKey || !amount ){
        return res.status(400).send({
            message:"fromAccount,toAccount,idempotencyKey,amount are required fields"
        })
    }
    const fromUserAccount = await accountModel.findOne({_id:fromAccount});
    const toUserAccount =   await accountModel.findOne({_id:toAccount});

    if(!fromUserAccount || !toUserAccount){
        return res.status(401).send({
            message:"fromAccount or toAccount is invalid"
        })
    }

    const isExistingTransaction = await accountModel.findOne({idempotencyKey})
    if(isExistingTransaction){
        if(isExistingTransaction.status==='PENDING'){
        return res.status(200).send({
            message:"transaction is still processing"
        })
    }
    if(isExistingTransaction.status==='COMPLETED'){
        return res.status(200).send({
            message:"transaction is COMPLETED",
            transaction:isExistingTransaction   
        })
    }
    if(isExistingTransaction.status==='FAILED'){
        return res.status(500).send({
            message:"transaction is FAILED, please try again"
        })
    }
    if(isExistingTransaction.status==='REVERSED'){
        return res.status(500).send({
            message:"transaction is REVERSED, please try again"
        })
    }
    }
    if(fromUserAccount.status!=='ACTIVE' || toUserAccount.status!=='ACTIVE'){
         return res.status(400).send({
            message:"fromAccount or toAccount is inactive"
        })
    }
    const senderBalance = await fromUserAccount.getBalance()
    if(senderBalance<amount){
        return res.status(400).send({
            message:`insufficient balance for this transaction, current balance is ${senderBalance} while the requested amount is ${amount}`
        })
    }


    // creating transaction
const session = await mongoose.startSesssion()
session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,toAccount,amount,idempotencyKey
    },{session})
    const debitLedger = await ledgerModel.create({
        account:fromAccount,
        type:"DEBIT",
        amount,
        transaction:transaction._id
    },{session})
    const creditLedger = await ledgerModel.create({
        account:toAccount,
        type:"CREDIT",
        amount,
        transaction:transaction._id
    },{session});
    transaction.status="COMPLETED";
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()
    
    res.status(201),send({
        message:"Transaction completed successfully",
        transaction
    })

    const receiver = await userModel.findById(toUserAccount.user);

    await sendTransactionEmail(req.user.email,req.user.name,amount,"DEBIT");
    await sendTransactionEmail(receiver.email,receiver.name,amount,"CREDIT");
    return;
}

module.exports = {createTransaction}