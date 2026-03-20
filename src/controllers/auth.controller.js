const userModel = require("../models/user.model")
var jwt = require('jsonwebtoken');
const emailService = require("../services/email.service");
/**
* - user register controller
* - POST /api/auth/register
*/
const registerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(422).send({
                message: "incorrect email or password"
            })
        }
        const user = await userModel.create({ name, email, password })
        var token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });
        res.cookie("token", token)
        res.status(201).send({
            message: "user registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token
        })
        await emailService.sendRegistrationEmail(user.email, user.name);
    } catch (e) {
        res.status(500).send({
            message: "Error occur while registering user",
        })
    }
}

const loginController = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select("+password")
        if (!user) {
            return res.status(401).send({
                message: "incorrect email or password"
            })
        }
        const isValidPassword = await user.comparePassword(password)
        if (!isValidPassword) {
            return res.status(401).send({
                message: "incorrect email or password"
            })
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })
        res.cookie("token", token)
        res.status(200).send({
            message: "user logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token
        })
    } catch (e) {
        res.status(500).send({
            message: `Error occur while Login ${e}`,
        })
    }
}
    module.exports = { registerController, loginController };