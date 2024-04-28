const mongoose = require("mongoose")
const blogSchema = mongoose.Schema({
    title :{
        type : String,
        required : true,
    },
    body :{
        type : String,
        required : true,
    },
    category:{
        type : String,
        required : true,
    },
    coverImageURL : {
        type : String,
        required : false,
    },
    createdBy : {
        type : mongoose.SchemaTypes.ObjectId,
        ref : "user"
    },

},{timestamps : true} );


const Blog = mongoose.model('blog',blogSchema);

module.exports = Blog ;