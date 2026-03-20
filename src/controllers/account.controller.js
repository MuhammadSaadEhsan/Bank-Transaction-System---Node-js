const accountModel = require('../models/account.model')
const createAccountController = async (req,res) =>{
    const user = req.user;
    try{
        const account = await accountModel.create({user:user._id})
        res.status(201).send({
            message:"account created successfully",
            account
        })
    }catch(e){
        res.status(500).send({
            message:"Error occur while creating account",
        })
    }
}
const getUserAccountController = async(req,res) =>{
    const userAccounts = await accountModel.find({user:req.user._id}) 
    if(!userAccounts){
        return res.status(404).send({
            message:"user has no any account"
        })
    }
    return res.send({
        message:"user accounts fetched succesfully",
        accounts: userAccounts
    })
}
const getAccountBalance = async(req,res) =>{
    try{
        const {accountId} = req.params;
        if(!accountId){
            return res.status(401).send({
                message:"accountId is required"
            })
        }
        const account = await accountModel.findById(accountId)
        if(!account){
            return res.status(404).send({
                message:"account not found"
            })
        }

        const balance = await account.getBalance()
        return res.status(200).send({
            message:"balance calculated successfully",
            balance
        })
    }catch(e){
        return res.status(500).send({
            message:`error while calculating balance ${e}`
        })
    }
}
module.exports = {createAccountController,getUserAccountController,getAccountBalance};