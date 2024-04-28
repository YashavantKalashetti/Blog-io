const { randomBytes, createHmac} = require("crypto")
const mongoose = require("mongoose");


const adminSchema = mongoose.Schema({
    fullName :{
        type : String,
        required:true,
    },
    email:{
        type : String,
        required: [true, "Please enter an email"],
        unique : true,
        lowercase : true,
    },
    salt:{  
        type : String,
    },
    password:{
        type : String,
        required : true,
        // minlength : [6, "Minimun password length is 6"]
    },
    profileImageURL:{
        type : String,
        default : '/images/default_2.png'
    },
    role:{
        type : String,
        default : "Client"
    },
    accessPermission:{
        type : String,
        default : "ADMIN"
    },
    roleDescription : {
        type : String,
        required : true,
    },
    instagramURL :{
        type : String,
    },
    linkedinURL :{
        type : String,
    },
    githubURL :{
        type : String,
    }
},
{timestamps : true} )


adminSchema.pre("save",function (next){
    
    const user = this;

    if(!user.isModified("password")) return


    const salt = randomBytes(16).toString();
    // const salt1 = crypto.randomUUID()

    try {
        const hashedPassword = createHmac('sha256',salt)
            .update(user.password)
            .digest("hex"); 

        this.salt = salt;
        this.password = hashedPassword;

        next();
    } catch (error) {
        console.log(error.message)
    }
    
})


const Admin = mongoose.model('admin',adminSchema);

module.exports = Admin;