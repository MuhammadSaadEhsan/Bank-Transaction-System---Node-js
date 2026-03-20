const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model")

async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const user = await userModel.findById(decoded.userId)
    if(!user){
        return res.status(401).json({
            message:"Unauthorized access, invalid token"
        })
    }
    req.user = user;
    next();

}
async function authSystemUserMiddleware(req,res,next){
    try{

        const token = req.header['authorization']?.split(' ')[1] || req.cookies.token;
        if(!token){
            return res.status(401).send({
            message:"Unauthorized access, token is missing"
        })
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const user = await userModel.findOne({_id:decoded.userId,systemUser:true}).select('+systemUser');
    if(!user.systemUser){
        return res.status(403).send({
            message:"Forbidden access, not a system user"
        })
    }
    req.user = user;
    next();
}
catch(e){
    res.status(401).json({
        message:"unauthorized access token is invalid"
    })
}
}
module.exports = {authMiddleware,authSystemUserMiddleware};