const express=require('express')
const app=express()

const userModel=require("./models/usermodel.js")
const postModel=require("./models/postmodel.js")
const path=require('path');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const cookieParser = require('cookie-parser');


app.set("view engine","ejs")
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());


app.get("/",function(req,res){
    res.render("index")
})


//creating the user and hashing its the password

app.post("/create", async function(req, res) {
    let { username, email, password, age } = req.body;

    let user = await userModel.findOne({ email });
    if (user) return res.status(500).send("user already registered");

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, async function(err, hash) {
            const user = await userModel.create({
                username,
                email,
                password: hash,
                age
            });
            var token = jwt.sign({ email: email, userid: user._id }, "srijan");
            res.cookie("token", token);
            res.status(200).render("profile", { user });
        });
    });
});


app.get("/login",function(req,res){

    res.render("login")
})

app.post("/login", async function(req, res) {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) return res.send("something went wrong");

    bcrypt.compare(password, user.password, function(err, result) {
        if (result) {
            var token = jwt.sign({ email: email, userid: user._id }, "srijan");
            res.cookie("token", token, { httpOnly: true, secure: false });
            res.status(200).render("profile", { user });
        } else {
            res.send("something went wrong");
        }
    });
});

app.get("/profile", isLoggedIn, async function(req, res) {
    let user = await userModel.findOne({ _id: req.user.userid }).populate("posts");
    res.render("profile", { user });
});

function isLoggedIn(req, res, next) {
    if (!req.cookies.token) return res.send("you need to be logged in first");

    let data = jwt.verify(req.cookies.token, "srijan");
    req.user = data;
    next();
}

app.get("/logout", function(req, res) {
    res.cookie("token", "", { httpOnly: true, secure: false, expires: new Date(0) });
    res.redirect("/login");
});

app.post("/post", isLoggedIn, async function(req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    let { title, content } = req.body;

    let post = await postModel.create({
        user: user._id,
        title,
        content
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
});

app.get("/delete/:id", isLoggedIn ,async function(req,res){
    let user=await postModel.deleteOne({_id:req.params.id})
    res.redirect("/profile")
})

app.get("/edit/:id",isLoggedIn,async function(req,res){
    let post=await postModel.findOne({_id:req.params.id}).populate("user")
    res.render("edit",{post})

})

app.post("/update/:id",isLoggedIn,async function(req,res){
    let post =await postModel.findOneAndUpdate({_id:req.params.id},{content: req.body.content})
    res.redirect("/profile")
})


app.listen(3000);

/* */