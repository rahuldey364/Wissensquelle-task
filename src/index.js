const express = require("express")
const mongoose = require("mongoose")
const route = require("../src/routes/route")
const app = express()

require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser : true
})
.then(() => console.log("mongoDB connected"))
.catch((err) => console.log(err))

app.use("/" , route)

app.listen(3000,() => {
    console.log("express app running")
})