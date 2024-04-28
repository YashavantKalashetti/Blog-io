require("dotenv").config();

const {Router} = require("express");
const multer = require("multer")
const path = require("path")
const User = require("../models/user")
const Admin = require("../models/admin")
const { createHmac } = require("crypto")
const {createTokenForUser} = require("../services/auth")

const router = Router();

// File Storage Using Multer
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/admin-profile/`))
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null,fileName)
    }
})

const upload = multer({ storage : fileStorage })

router.get('/signin',(req,res)=>{
    return res.render('signin',{
        registered : req.query.registered,
    })
});

router.post('/signin',async (req,res)=>{
    const { email, password } = req.body;

    const user = await User.findOne({email})

    if(!user) {
        return res.render('signin', {emailError : "Inncorrect Email"})
    }

    const salt = user.salt
    const hashedPassword = user.password

    // Hashing the user entered password
    const userProvidedHash = createHmac("sha256",salt)
    .update(password)
    .digest("hex");

    if(hashedPassword !== userProvidedHash) {
        return res.render('signin', {passwordError : "Inncorrect password"})
    }

    const token = createTokenForUser(user)

    try{
        // redirecting to home page in case of correct details
        res.cookie(process.env.WEB_TOKEN,token,{httpOnly:true, secure:true}).redirect('/?loggedIn=True')
    }catch {    
        console.log("------------------- Server Error -------------------")
        return res.render('/login', {serverError : "Server Error"})
    }
    
});

router.get('/signup',(req,res)=>{
    return res.render('signup')
});


router.post('/signup',async (req,res)=>{
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({email})

    if(userExists){
        return res.render("signup",{
            accountExists : "User with this email already exists"
        })
    }

    try {
        await User.create({
            fullName,   
            email,
            password
        });
    } catch (error) {
        return res.status(401).render({error :  "There was an error creating your Account"})
    }

    
    // console.log("A new user created")
    return res.status(201).redirect("/user/signin?registered=True");
});

router.get('/logout',(req,res)=>{
    // console.log("Logout")
    return res.clearCookie(process.env.WEB_TOKEN).redirect("/user/signin")
})

router.get('/admin-signup',(req,res)=>{
    return res.render('admin-signup')
});

router.post('/admin-signup', upload.single('coverImage'), async(req,res)=>{
    let { fullName, email, password, role, roleDescription, adminKey, instagramURL, githubURL, linkedinURL } = req.body;
    // console.log("A new user created")

    if(adminKey !== process.env.ADMIN_KEY ){
        return res.render("admin-signup",{
            adminKeyError : "Wrong Admin Key"
        })
    }

    const adminExists = await Admin.findOne({email})

    if(adminExists){
        return res.render("admin-signup",{
            accountExists : "User with this email already exists"
        })
    }

    await Admin.create({
        fullName,
        email,
        password,
        role,
        roleDescription,
        instagramURL,
        githubURL,
        linkedinURL,
        profileImageURL : `/uploads/admin-profile/${req.file.filename}`
    });
    
    return res.status(201).redirect("/user/admin-signin?registered=True");
});

router.get('/admin-signin',(req,res)=>{
    return res.render('admin-signin',{
        registered : req.query.registered,
    })
});

router.post('/admin-signin',async (req,res)=>{
    const { email, password } = req.body;

    const admin = await Admin.findOne({email})

    if(!admin) {
        return res.render('admin-signin', {emailError : "User with this Email does not Exists."})
    }

    const salt = admin.salt
    const hashedPassword = admin.password

    // Hashing the user entered password
    const userProvidedHash = createHmac("sha256",salt)
    .update(password)
    .digest("hex");

    if(hashedPassword !== userProvidedHash) {
        return res.render('admin-signin', {passwordError : "Inncorrect password"})
    }

    const token = createTokenForUser(admin)

    try{
        // redirecting to home page in case of correct details
        return res.cookie(process.env.WEB_TOKEN,token,{httpOnly:true}).redirect('/?loggedIn=True')
    }catch {    
        console.log("Server Error -------------")
        return res.render('/login', {serverError : "Server Error"})
    }
    
});

// In case of wrong url
router.use((req,res)=>{
    return res.status(404).render("error_404",{
        user : req.user
    })
})

module.exports = router;