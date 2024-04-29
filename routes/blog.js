const {Router} = require("express")
const multer = require("multer")
const path = require("path")
const OpenAI = require("openai");

const Blog = require("../models/blog")
const { validateToken } = require("../services/auth")
const uploadOnCloudinary = require('../services/cloudinaryUpload.js')
const upload = require('../services/fileUpload.js')


const router = Router();


router.get("/add-new",(req,res)=>{
    return res.status(200).render('addBlog',{
        user: req.user,
    })
})

router.get("/myblogs",async (req,res)=>{
    const currentUserId  = req.user._id;
    const userBlogs = await Blog.find({ createdBy : currentUserId}).sort({'createdAt': -1}).populate("createdBy");

    const verifyToken = req.cookies[process.env.WEB_TOKEN];
    if(verifyToken){
        const userPayload = validateToken(verifyToken);
        req.user = userPayload;
    }

    // console.log(`Payload : ${JSON.stringify(req.user)}`)

    return res.render("myblogs",{
        user : req.user,
        userBlogs : userBlogs
    });
})


router.post("/add-new",upload.single("coverImage") ,async (req,res)=>{
    let { title,body,category } = req.body;
    if(category === "Choose a Category"){
        category = "Others";
    }

    try {
        console.log(req.file)
        const localFilePath = req.file?.path 
        if(!localFilePath){
            return res.status(400).json({error: "Cover Image picture is required"})
        }
    
        const globalLink = await uploadOnCloudinary(localFilePath)
        if(!globalLink){
            return res.status(400).json({error: "Cover Image picture is required by cloudinary"})
        }

        const blog = await Blog.create({
            title,
            body,
            category,
            createdBy : req.user._id,
            coverImageURL : globalLink.url
        })
    


        return res.status(200).redirect(`/blog/${blog._id}`);
    
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }

})


router.post('/text-refrase',async(req,res)=>{
    const { body, blogId } = req.body;
    const blog = await Blog.updateOne({_id:blogId}, {$set:{body:body}})
    return res.status(200).redirect(`/blog/${blogId}`);
})







router.get("/:id",async (req,res)=>{
    
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy");

        if(blog){
            return res.render("blog",{
                user : req.user,
                blog
            });
        }else{
            return res.status(404).render("error_404",{
            user : req.user
            })
        }

    } catch (error) {
        // console.log(`Error : ${error.message}`);
        return res.status(404).render("error_404",{
            user : req.user
        })
    }
    
})

// In case of wrong url
router.use((req,res)=>{
    return res.status(404).render("error_404",{
        user : req.user
    })
})

module.exports = router ;