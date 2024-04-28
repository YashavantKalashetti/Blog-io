const {Router} = require("express");
const router = Router();
const Admin = require("../models/admin")

router.get("/",async (req,res)=>{
    const allAdmins = await Admin.find({}).sort({'createdAt': 1});
    return res.status(200).render('about',{
        user: req.user,
        allAdmins
    })
})

router.get("/contact",(req,res)=>{
    return res.status(200).render('contact',{
        user: req.user,
    })
})


module.exports = router;