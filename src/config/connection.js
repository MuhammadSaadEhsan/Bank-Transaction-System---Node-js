const mongoose = require('mongoose');

const connectToDatabase = async () =>{
    await mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Successfully connected to Database!")
    }).catch((err)=>{
        console.log("Error while connecting to database ",err)
    })
}

module.exports = connectToDatabase;