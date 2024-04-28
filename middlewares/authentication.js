require("dotenv").config()

const { validateToken } = require("../services/auth")

function checkForAuthenticationCookie (req,res,next){

        const verifyToken = req.cookies[process.env.WEB_TOKEN];
        if(!verifyToken){
            return res.status(401).redirect('/user/signin')
        }

        try{
            const userPayload = validateToken(verifyToken);
            req.user = userPayload;
        }catch(error){
            // Internal server error - 500 
            return res.status(401).redirect('/user/signin')
        }
        
        return next();
    
}

module.exports = {
    checkForAuthenticationCookie,
}