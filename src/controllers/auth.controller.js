const user = require("../models/user.model")
const registerController = async (req,res) =>{
    try{
        const {name,email,password} = req.body;
        const existingUser = user.findOne({email});
        if(existingUser){
            return res.status(422).send({
                message:"incorrect email or password"
            })
        }

    }catch(e){

    }
}