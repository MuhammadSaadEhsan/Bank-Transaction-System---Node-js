const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"Account must be associated with a user"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"Status must be either ACTIVE, FROZEN or CLOSED"
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true,"Account must have a currency"],
        default:"pkr"
    }
},{timestamps:true})

accountSchema.index({user:1,status:1}) // one to one relationship between user and account
const accountModel = mongoose.model("account",accountSchema)
module.exports = accountModel;