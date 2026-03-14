const userModel = require("../models/user.model")
var jwt = require('jsonwebtoken');
const emailService = require("../services/email.service");
/**
* - user register controller
* - POST /api/auth/register
*/
const registerController = async (req,res) =>{
    try{
        const {name,email,password} = req.body;
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(422).send({
                message:"incorrect email or password"
            })
        }
        const user = await userModel.create({name,email,password})
        var token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });
        res.cookie("token",token)
        res.status(201).send({
            message:"user registered successfully",
            user:{
                _id:user._id,
                name:user.name,
                email:user.email,
            },
            token            
        })
        await emailService.sendRegistrationEmail(user.email, user.name);
    }catch(e){
        res.status(500).send({
            message:"Error occur while registering user",
        })
    }
}

module.exports = {registerController};