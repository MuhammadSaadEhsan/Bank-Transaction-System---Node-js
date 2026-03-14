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

module.exports = {createAccountController};