const express = require('express');
const app = express();
require('dotenv').config()
const authRouter = require('./routes/auth.route')
app.use(express.json())
app.use('/api/auth',authRouter)

module.exports = app;