require('dotenv').config()

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const functions = require('firebase-functions')

const userRoute = require("./routes/user")
const blogRoute = require("./routes/blog")
const homeRouter = require("./routes/home")
const aboutRoute = require("./routes/about")

const Blog = require("./models/blog")

const path = require('path');
const { checkForAuthenticationCookie } = require("./middlewares/authentication")

const app = express();
const PORT = process.env.PORT;

mongoose
    .connect(process.env.MONGO_URL)
    .then((e)=> console.log("Connected to mongoDb Sucessfully."))
    .catch((e)=> console.log(`Error : ${e.message}`))

app.set("view engine","ejs");
app.set("views",path.resolve('./views'));

app.use(express.urlencoded({extended : false}));
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());
app.use(express.json());

app.use("/user",userRoute);

app.use("/",homeRouter);

// Only Authenticating for blog paths
app.use(checkForAuthenticationCookie);

app.use("/blog",blogRoute);

app.use("/About",aboutRoute)

app.use((req,res)=>{
    return res.status(404).render("error_404",{
        user : req.user
    })
})

app.listen(PORT,()=>{
    console.log(`SERVER STARTED AT PORT ${PORT}`)
})


// exports.app = functions.https.onRequest(app);