const mongoose=require ('mongoose') ;

mongoose.connect("mongodb://127.0.0.1:27017/linkdin")

const userSchema=mongoose.Schema({
    username:String,
    password:String,
    email:{
       type:String,
       required:true,
       unique:true, 
    },
    age:Number,
    posts:[ {
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }]
})
module.exports=mongoose.model("user",userSchema)