const userModel = require("../models/userModel")
const CryptoJs = require("crypto-js")
const jwt = require("jsonwebtoken")

const signUp = async (req, res) => {
    try {
        const { firstName, middleName, lastName, phone, email, password, role , country} = req.body
        //checking and validating last name as it is a required field
        if (!firstName || !/^(?![\. ])[a-zA-Z\. ]+(?<! )$/.test(firstName)) return res.status(400).json({ status: false, message: "please enter valid first name" })
        //middle name is not mandatory but if it is coming then i am validating here
        if (middleName && !/^(?![\. ])[a-zA-Z\. ]+(?<! )$/.test(middleName)) return res.status(400).json({ status: false, message: "please enter valid middle name" })
        //checking and validating last name as it is a required field
        if (!lastName || !/^(?![\. ])[a-zA-Z\. ]+(?<! )$/.test(lastName)) return res.status(400).json({ status: false, message: "please enter valid last name" })
        //checking if user have entered a email or not and also checking if it is a valid email format or not
        if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).json({ status: false, message: "please enter valid email" })
        //checking if user have entered a phone no or not and also checking if it is a valid phone no or not(only indian no for now)
        if (!phone || !/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ status: false, message: "please enter valid phone number" })
        //checking if user have entered a password or not
        if (!password) return res.status(400).json({ status: false, message: "please enter paassword for signup" })
        //check if the roles entered are the correct one or not
        if (["user", "agent", "admin"].indexOf(role) == -1) return res.status(400).json({ status: false, message: "please enter role, role should be user/agent/admin" })
        //checking country name format validation
        if(country && !/^(?![\. ])[a-zA-Z\. ]+(?<! )$/.test(country)) return res.status(400).json({ status: false, message: "country format wrong" })
        //checking if the email is registered before with the same role
        const findEmail = await userModel.findOne({ email: email, role: role })
        if (findEmail) return res.status(400).json({ status: false, message: "email already register for this role" })
        //checking if the phone number is registered before with the same role
        const findPhone = await userModel.findOne({ phone: phone, role: role })
        if (findPhone) return res.status(400).json({ status: false, message: "phone number already register for this role" })
        //encrypting password
        const cipherPassword = CryptoJs.AES.encrypt(password, process.env.SECRETCODE_PASSWORD).toString();
        req.body.password = cipherPassword
        //user creating
        const createUser = await userModel.create(req.body)
        res.status(200).json({ status: true, data: createUser })
    }
    catch (err) {
        res.status(500).json({ status: false, message: err })
    }
}
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body
        //checking if user registered with the entered email or not
        const findUser = await userModel.findOne({ email: email, role: role })
        if (!findUser) return res.status(400).json({ status: false, message: "user not registered with this email id for this role" })
        //password match
        const decrypt = CryptoJs.AES.decrypt(findUser.password, process.env.SECRETCODE_PASSWORD)
        const originalPassword = decrypt.toString(CryptoJs.enc.Utf8)
        if (password != originalPassword) return res.status(400).json({ status: false, message: "you have entered a invalid password" })
        //creating jwt token for sucessful login and valid credentials
        const token = jwt.sign({ userId: findUser._id },process.env.SECRETCODE_JWT )
        res.status(200).json({ status: true, data: { token: token } })

    } catch (error) {
        res.status(500).json({ status: false, message: err })
    }
}
module.exports = { signUp , login }