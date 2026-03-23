const mongoose = require('mongoose')

const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        unique: [true, 'token should be unique'],
        required: [true, 'token is required'],
    }
},
{ timestamps: true })

tokenBlackListSchema.index({createdAt:1},{
    expireAfterSeconds:3*24*60*60
})

const tokenBlackListModel = mongoose.model("tokenBlackList",tokenBlackListSchema)
module.exports = tokenBlackListModel