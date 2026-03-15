const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'accounts',
        immutable:true,
        index:true,
        required:[true,"account is required for ledger"]
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for ledger"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        requied:[true,"transaction is required for ledger"],
        immutable:true,
        index:true
    },
    type:{
        type:String,
        enum:{
            values:['DEBIT','CREDIT'],
            required:[true,'transaction type is required for ledger']
        },
        immutable:true,
        required:[true,'ledger type is required']
    }
},{timestamps:true})

function preventLedgerModification(next){
    throw new Error('ledger modifications are immutable')
}

ledgerSchema.pre('findOne',preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);

const ledgerModel = mongoose.model('ledger',ledgerSchema)
module.exports= {ledgerModel}