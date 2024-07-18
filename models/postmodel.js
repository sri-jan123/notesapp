const mongoose=require('mongoose');

const postSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    date:{
        type:Date,
        default:Date.now
    },
    title:String,
    content:String
});

module.exports=mongoose.model("post",postSchema);

