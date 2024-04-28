const {Router} = require("express");
const Blog = require("../models/blog")
const { validateToken } = require("../services/auth")
const router = Router();

router.use(verification);

router.get("/",async (req,res)=>{
    const allBlogs = await Blog.find({}).sort({'createdAt': -1}).populate("createdBy");

    res.render("home",{
        loggedIn : req.query.loggedIn,
        user : req.user,
        allBlogs :allBlogs
    });
})

// using in case of selection category of blogs

router.post("/",async (req,res)=>{
    let allBlogs;
    if( req.body.category === "All Blogs" || req.body.category === "Select a Category"){
        allBlogs = await Blog.find({}).sort({'createdAt': -1}).populate("createdBy");
    }
    else{
        allBlogs = await Blog.find({category : req.body.category}).sort({'createdAt': -1}).populate("createdBy");
    }

    // console.log(`Payload : ${JSON.stringify(req.user)}`)z
    return res.render("home",{
        user : req.user,
        allBlogs :allBlogs
    });
})

router.get("/advertisement",(req,res)=>{
    
    return res.status(200).render('advertisement',{
        user: req.user,
    })
})

router.get("/careers",(req,res)=>{
    
    return res.status(200).render('careers',{
        user: req.user,
    })
})

function verification(req,res,next){
    const verifyToken = req.cookies[process.env.WEB_TOKEN];
    if(verifyToken){
        const userPayload = validateToken(verifyToken);
        req.user = userPayload;
    }
    next();
}


module.exports = router;