const {Router} = require("express")
const multer = require("multer")
const path = require("path")
const OpenAI = require("openai");

const Blog = require("../models/blog")
const { validateToken } = require("../services/auth")


const router = Router();


// File Storage Using Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve('./public/uploads/'))
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null,fileName)
    }
})

const upload = multer({ storage: storage })


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
        const blog = await Blog.create({
            title,
            body,
            category,
            createdBy : req.user._id,
            coverImageURL : `/uploads/${req.file.filename}`
        })
    
        // const openai = new OpenAI({
        //     apiKey: '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',
        //   });
          
        //   const response = await openai.chat.completions.create({
        //     model: "gpt-3.5-turbo",
        //     messages: [
        //       {
        //         "role": "system",   
        //         "content": "You will be provided with statements, and your task is to convert them to standard English with clear meaning."
        //       },
        //       {
        //         "role": "user",
        //         "content": body
        //       }
        //     ],
        //     temperature: 1,
        //     max_tokens: 64,
        //     top_p: 1,
        //   });



        return res.status(200).redirect(`/blog/${blog._id}`);
    
        // return res.status(201).render('text-refrase',{
        //     enteredText: body, 
        //     translatedText: response.choices[0].message.content,
        //     blogId:blog._id
        // })
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