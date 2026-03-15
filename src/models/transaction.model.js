const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"accounts",
        required:[true,"From account is required for a transaction"],
        index:true
    },
    toAccount:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"accounts",
        required:[true,"To account is required for a transaction"],
        index:true
    },
    amount:{
        type:Number,
        required:[true,'Amount is required for transaction'],
        min:0
    },
    status:{
        type:String,
        enum:{
            values:['PENDING','COMPLETED','FAILED','REVERSED']
        },
        default:'PENDING'
    },
    idempotencyKey:{
        type:String,
        required:[true,"idempotency key is required for a transaction"],
        unique:true,
        index:true
    }
},{timestamps:true})

const transactionModel = mongoose.model('transaction',transactionSchema)
module.exports = {transactionModel}